'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SankeyNode {
    id: string;
    label: string;
    color: string;
}

interface SankeyLink {
    source: string;
    target: string;
    value: number;
}

interface SankeyDiagramProps {
    nodes: SankeyNode[];
    links: SankeyLink[];
    height?: number;
    className?: string;
}

// Color palette for flow paths
const flowColors = [
    'rgba(125, 211, 168, 0.4)', // emerald
    'rgba(139, 92, 246, 0.4)',  // purple
    'rgba(59, 130, 246, 0.4)',  // blue
    'rgba(251, 191, 36, 0.4)',  // amber
    'rgba(244, 63, 94, 0.4)',   // rose
];

export function SankeyDiagram({ nodes, links, height = 400, className = '' }: SankeyDiagramProps) {
    // Calculate node positions and link paths
    const { nodePositions, linkPaths, totalValue } = useMemo(() => {
        // Separate nodes by type (sources on left, targets on right)
        const sourceIds = new Set(links.map(l => l.source));
        const targetIds = new Set(links.map(l => l.target));

        const leftNodes = nodes.filter(n => sourceIds.has(n.id) && !targetIds.has(n.id));
        const rightNodes = nodes.filter(n => targetIds.has(n.id));
        const middleNodes = nodes.filter(n => sourceIds.has(n.id) && targetIds.has(n.id));

        // Calculate total value for scaling
        const total = links.reduce((sum, l) => sum + l.value, 0);

        // Position nodes
        const positions: Record<string, { x: number; y: number; height: number }> = {};
        const nodeHeight = height / Math.max(leftNodes.length, rightNodes.length, 1);
        const nodeWidth = 120;
        const chartWidth = 600;

        // Left column
        let yOffset = 0;
        leftNodes.forEach((node, i) => {
            const incomingValue = links.filter(l => l.source === node.id).reduce((s, l) => s + l.value, 0);
            const h = Math.max((incomingValue / total) * height * 0.8, 30);
            positions[node.id] = {
                x: 0,
                y: yOffset + (nodeHeight * i * 0.3),
                height: h
            };
            yOffset += h * 0.2;
        });

        // Right column
        yOffset = 0;
        rightNodes.forEach((node, i) => {
            const incomingValue = links.filter(l => l.target === node.id).reduce((s, l) => s + l.value, 0);
            const h = Math.max((incomingValue / total) * height * 0.8, 30);
            positions[node.id] = {
                x: chartWidth - nodeWidth,
                y: yOffset + (nodeHeight * i * 0.3),
                height: h
            };
            yOffset += h * 0.2;
        });

        // Generate curved paths for links
        const paths = links.map((link, i) => {
            const source = positions[link.source];
            const target = positions[link.target];
            if (!source || !target) return null;

            const sourceX = source.x + nodeWidth;
            const sourceY = source.y + source.height / 2;
            const targetX = target.x;
            const targetY = target.y + target.height / 2;

            const controlX = (sourceX + targetX) / 2;
            const thickness = Math.max((link.value / total) * height * 0.3, 4);

            return {
                d: `M ${sourceX},${sourceY} C ${controlX},${sourceY} ${controlX},${targetY} ${targetX},${targetY}`,
                thickness,
                color: flowColors[i % flowColors.length],
                value: link.value,
                source: link.source,
                target: link.target,
            };
        }).filter(Boolean);

        return { nodePositions: positions, linkPaths: paths, totalValue: total };
    }, [nodes, links, height]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    if (links.length === 0) {
        return (
            <div className={`flex items-center justify-center ${className}`} style={{ height }}>
                <p className="text-white/50">No flow data to display</p>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <svg width="100%" height={height} viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
                {/* Links */}
                {linkPaths.map((path, i) => path && (
                    <motion.path
                        key={i}
                        d={path.d}
                        fill="none"
                        stroke={path.color}
                        strokeWidth={path.thickness}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                ))}

                {/* Nodes */}
                {nodes.map((node) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;

                    return (
                        <motion.g
                            key={node.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <rect
                                x={pos.x}
                                y={pos.y}
                                width={120}
                                height={pos.height}
                                rx={8}
                                fill={node.color}
                                opacity={0.9}
                            />
                            <text
                                x={pos.x + 60}
                                y={pos.y + pos.height / 2}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="white"
                                fontSize={12}
                                fontWeight={500}
                            >
                                {node.label}
                            </text>
                        </motion.g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-white/50">
                <span>Total Flow: {formatCurrency(totalValue)}</span>
            </div>
        </div>
    );
}

export default SankeyDiagram;
