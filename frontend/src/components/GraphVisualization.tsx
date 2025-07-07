
import React, { useState, useEffect } from 'react';
import { Eye, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKnowledgeGraph } from '@/hooks/useKnowledgeGraph';
import { GraphVisualizationData, GraphNode, GraphRelationship } from '@/types';

/**
 * Graph Visualization Component
 * Displays the knowledge graph in a visual format
 */
export const GraphVisualization: React.FC = () => {
  const { status } = useKnowledgeGraph();
  const [isLoading, setIsLoading] = useState(false);
  const [graphData, setGraphData] = useState<GraphVisualizationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isKnowledgeGraphReady = status.status === 'ready';

  // Load graph visualization data
  const loadGraphData = async () => {
    if (!isKnowledgeGraphReady) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to get graph visualization data
      const response = await fetch('/api/knowledge-graph/visualization');
      
      if (!response.ok) {
        throw new Error('Failed to load graph data');
      }

      // Simulate graph data - in real implementation this would come from the API
      const mockGraphData: GraphVisualizationData = {
        nodes: [
          { id: '1', label: 'Artificial Intelligence', type: 'entity' },
          { id: '2', label: 'Machine Learning', type: 'entity' },
          { id: '3', label: 'Neural Networks', type: 'entity' },
          { id: '4', label: 'Deep Learning', type: 'entity' },
          { id: '5', label: 'Document 1', type: 'document' },
          { id: '6', label: 'Document 2', type: 'document' },
          { id: '7', label: 'Natural Language Processing', type: 'entity' },
          { id: '8', label: 'Computer Vision', type: 'entity' },
        ],
        relationships: [
          { id: 'r1', source: '1', target: '2', type: 'includes' },
          { id: 'r2', source: '2', target: '3', type: 'uses' },
          { id: 'r3', source: '2', target: '4', type: 'includes' },
          { id: 'r4', source: '4', target: '3', type: 'based_on' },
          { id: 'r5', source: '1', target: '5', type: 'mentioned_in' },
          { id: 'r6', source: '2', target: '6', type: 'mentioned_in' },
          { id: 'r7', source: '1', target: '7', type: 'includes' },
          { id: 'r8', source: '1', target: '8', type: 'includes' },
        ],
      };

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGraphData(mockGraphData);

    } catch (err) {
      console.error('Error loading graph data:', err);
      setError('Failed to load graph visualization. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple network visualization using SVG
  const renderGraph = () => {
    if (!graphData) return null;

    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 120;

    // Position nodes in a circle
    const nodePositions = graphData.nodes.map((node, index) => {
      const angle = (index / graphData.nodes.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { ...node, x, y };
    });

    return (
      <div className="w-full max-w-4xl mx-auto">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="border rounded-lg bg-background">
          {/* Render relationships */}
          {graphData.relationships.map((rel) => {
            const sourceNode = nodePositions.find(n => n.id === rel.source);
            const targetNode = nodePositions.find(n => n.id === rel.target);
            
            if (!sourceNode || !targetNode) return null;
            
            return (
              <line
                key={rel.id}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke="hsl(var(--border))"
                strokeWidth="2"
                opacity="0.6"
              />
            );
          })}
          
          {/* Render nodes */}
          {nodePositions.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="20"
                fill={node.type === 'document' ? 'hsl(var(--graph-secondary))' : 'hsl(var(--primary))'}
                opacity="0.8"
                stroke="hsl(var(--background))"
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + 35}
                textAnchor="middle"
                fontSize="12"
                fill="hsl(var(--foreground))"
                className="font-medium"
              >
                {node.label.length > 15 ? `${node.label.substring(0, 15)}...` : node.label}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
            <span>Entities</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Documents</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Graph Visualization</h3>
        </div>
        
        {isKnowledgeGraphReady && (
          <Button
            onClick={loadGraphData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        )}
      </div>

      {/* Visualization Area */}
      <div className="p-6 bg-card rounded-lg border">
        {!isKnowledgeGraphReady ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold mb-2">No Graph to Visualize</h4>
            <p className="text-muted-foreground">
              Build a knowledge graph first to see the visualization.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading graph visualization...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={loadGraphData} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        ) : graphData ? (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2">Knowledge Graph Network</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {graphData.nodes.length} entities and {graphData.relationships.length} relationships
              </p>
            </div>
            {renderGraph()}
          </div>
        ) : (
          <div className="text-center py-12">
            <Button onClick={loadGraphData} className="bg-primary hover:bg-primary/90">
              Load Visualization
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
