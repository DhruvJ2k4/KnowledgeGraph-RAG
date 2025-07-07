from neo4j import GraphDatabase
from config import settings

class Neo4jConnector:
    def __init__(self):
        self.uri = settings.neo4j_uri
        self.user = settings.neo4j_username
        self.password = settings.neo4j_password
        self.driver = None

    def connect(self):
        try:
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
        except Exception as e:
            print(f"Failed to create the driver: {e}")
            raise

    def close(self):
        if self.driver:
            self.driver.close()

    def execute_query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return result.data()

    def verify_connection(self):
        try:
            with self.driver.session() as session:
                session.run("RETURN 1")
            return True
        except Exception as e:
            print(f"Connection verification failed: {e}")
            return False