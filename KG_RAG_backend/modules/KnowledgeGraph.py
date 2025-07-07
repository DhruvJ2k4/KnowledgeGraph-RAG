from neo4j import GraphDatabase
from config import NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD
import json
import logging
from pathlib import Path

URI = NEO4J_URI
AUTH = (NEO4J_USERNAME, NEO4J_PASSWORD)

class KnowledgeGraph:
    def __init__(self, username: str, uri=URI, auth=AUTH):
        self.username = username
        self.driver = GraphDatabase.driver(uri, auth=auth)
        self.driver.verify_connectivity()
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Set up user-specific paths
        self.entities_file = Path(f"data/entities/{username}/entities_{username}.json")
        self.graph_dir = Path(f"data/graphs/{username}")
        self.graph_dir.mkdir(parents=True, exist_ok=True)

    def close(self):
        self.driver.close()

    def add_document(self, doc_id):
        try:
            with self.driver.session() as session:
                session.run(
                    "MERGE (d:Document {doc_id: $doc_id})",
                    doc_id=doc_id
                )
        except Exception as e:
            self.logger.error(f"Error adding document {doc_id}: {str(e)}")
            raise

    def add_entity(self, entity_name, chunk_id):
        try:
            with self.driver.session() as session:
                session.run(
                    "MERGE (e:Entity {name: $entity_name}) "
                    "ON CREATE SET e.chunk_ids = [$chunk_id] "
                    "ON MATCH SET e.chunk_ids = CASE "
                    "WHEN NOT $chunk_id IN e.chunk_ids THEN e.chunk_ids + $chunk_id "
                    "ELSE e.chunk_ids END",
                    entity_name=entity_name, chunk_id=chunk_id
                )
        except Exception as e:
            self.logger.error(f"Error adding entity {entity_name}: {str(e)}")
            raise

    def create_entity_doc_relationship(self, entity_name, doc_id):
        try:
            with self.driver.session() as session:
                session.run(
                    "MATCH (e:Entity {name: $entity_name}) "
                    "MATCH (d:Document {doc_id: $doc_id}) "
                    "MERGE (e)-[r:MENTIONED_IN]->(d) "
                    "ON CREATE SET r.chunk_ids = [$chunk_id] "
                    "ON MATCH SET r.chunk_ids = CASE "
                    "WHEN NOT $chunk_id IN r.chunk_ids THEN r.chunk_ids + $chunk_id "
                    "ELSE r.chunk_ids END",
                    entity_name=entity_name, 
                    doc_id=doc_id,
                    chunk_id=str(doc_id)
                )
        except Exception as e:
            self.logger.error(f"Error creating entity-document relationship for {entity_name} and doc {doc_id}: {str(e)}")
            raise

    def create_entity_relationship(self, entity1_name, entity2_name, chunk_id):
        try:
            with self.driver.session() as session:
                session.run(
                    "MATCH (e1:Entity {name: $entity1_name}) "
                    "MATCH (e2:Entity {name: $entity2_name}) "
                    "WHERE e1 <> e2 "
                    "MERGE (e1)-[r:RELATED_TO]-(e2) "
                    "ON CREATE SET r.chunk_ids = [$chunk_id], r.count = 1 "
                    "ON MATCH SET r.chunk_ids = CASE "
                    "WHEN NOT $chunk_id IN r.chunk_ids THEN r.chunk_ids + $chunk_id "
                    "ELSE r.chunk_ids END, "
                    "r.count = r.count + 1",
                    entity1_name=entity1_name, 
                    entity2_name=entity2_name, 
                    chunk_id=chunk_id
                )
        except Exception as e:
            self.logger.error(f"Error creating entity relationship between {entity1_name} and {entity2_name}: {str(e)}")
            raise

    def get_entity_details(self, entity_name):
        with self.driver.session() as session:
            result = session.run(
                "MATCH (e:Entity {name: $entity_name}) "
                "RETURN e.name as name, e.chunk_ids as chunk_ids",
                entity_name=entity_name
            )
            return result.single()

    def get_related_entities(self, entity_name):
        with self.driver.session() as session:
            result = session.run(
                "MATCH (e:Entity {name: $entity_name})-[r:RELATED_TO]-(related:Entity) "
                "RETURN related.name as name, r.count as relationship_count, r.chunk_id as chunk_id",
                entity_name=entity_name
            )
            return list(result)

    def get_all_entities(self):
        with self.driver.session() as session:
            result = session.run(
                "MATCH (e:Entity) "
                "RETURN e.name as name, e.chunk_ids as chunk_ids"
            )
            return list(result)

    def get_graph_stats(self):
        """Get the total number of nodes and relationships in the graph."""
        with self.driver.session() as session:
            node_count_result = session.run("MATCH (n) RETURN count(n) as count")
            node_count = node_count_result.single()["count"]

            relationship_count_result = session.run("MATCH ()-[r]->() RETURN count(r) as count")
            relationship_count = relationship_count_result.single()["count"]
            
            return {
                "node_count": node_count,
                "relationship_count": relationship_count
            }

    def create_graph(self):
        """Create knowledge graph from entities file."""
        try:
            # Ensure the graph is empty before creation
            self.delete_graph()
            
            if not self.entities_file.exists():
                raise FileNotFoundError(f"Entities file not found at {self.entities_file}")
                
            with open(self.entities_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            for key, entities in data.items():
                try:
                    doc_id = int(key[1:3])
                    # Add document node
                    self.add_document(doc_id)

                    # Process entities
                    if not isinstance(entities, list):
                        self.logger.warning(f"Expected list of entities for {key}, got {type(entities)}")
                        continue
                        
                    # Add entities and their relationships
                    for entity in entities:
                        if not isinstance(entity, str):
                            self.logger.warning(f"Invalid entity type in {key}: {type(entity)}")
                            continue
                            
                        self.add_entity(entity, key)
                        self.create_entity_doc_relationship(entity, doc_id)
                    
                    # Create relationships between entities in the same chunk
                    for i, entity1 in enumerate(entities):
                        for entity2 in entities[i+1:]:  # Only process each pair once
                            if entity1 != entity2:
                                self.create_entity_relationship(entity1, entity2, key)
                                
                except ValueError as ve:
                    self.logger.error(f"Error processing key {key}: {str(ve)}")
                    continue
                except Exception as e:
                    self.logger.error(f"Unexpected error processing {key}: {str(e)}")
                    continue
                    
        except FileNotFoundError:
            self.logger.error(f"Entity file not found at {self.entities_file}")
            raise
        except json.JSONDecodeError:
            self.logger.error(f"Invalid JSON format in {self.entities_file}")
            raise
        except Exception as e:
            self.logger.error(f"Error creating knowledge graph: {str(e)}")
            raise

    def delete_graph(self):
        """Delete all nodes and relationships from the knowledge graph."""
        try:
            with self.driver.session() as session:
                # Delete all relationships and nodes
                session.run("MATCH (n) DETACH DELETE n")
                self.logger.info("Successfully deleted all nodes and relationships from the knowledge graph")
        except Exception as e:
            self.logger.error(f"Error deleting knowledge graph: {str(e)}")
            raise
