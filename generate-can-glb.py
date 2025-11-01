#!/usr/bin/env python3
"""
Generate a procedural GLB file for a 12oz aluminum can.
Creates a cylinder mesh with proper UV mapping for texture application.
"""

import struct
import json
import base64
import math

# Can dimensions (in meters, scaled for web viewing)
CAN_RADIUS = 0.031  # ~31mm radius (62mm diameter for standard 12oz can)
CAN_HEIGHT = 0.123  # ~123mm height
SEGMENTS = 32  # Number of segments around the cylinder

def create_cylinder_geometry():
    """Create vertices, normals, UVs, and indices for a cylinder"""
    vertices = []
    normals = []
    uvs = []
    indices = []
    
    # Generate vertices for the cylinder body
    for i in range(SEGMENTS + 1):
        angle = (i / SEGMENTS) * 2 * math.pi
        x = math.cos(angle) * CAN_RADIUS
        z = math.sin(angle) * CAN_RADIUS
        u = i / SEGMENTS
        
        # Bottom vertex
        vertices.extend([x, 0, z])
        normals.extend([math.cos(angle), 0, math.sin(angle)])
        uvs.extend([u, 0])
        
        # Top vertex
        vertices.extend([x, CAN_HEIGHT, z])
        normals.extend([math.cos(angle), 0, math.sin(angle)])
        uvs.extend([u, 1])
    
    # Generate indices for cylinder body
    for i in range(SEGMENTS):
        base = i * 2
        indices.extend([
            base, base + 1, base + 2,
            base + 1, base + 3, base + 2
        ])
    
    # Add top and bottom caps
    center_bottom_idx = len(vertices) // 3
    vertices.extend([0, 0, 0])
    normals.extend([0, -1, 0])
    uvs.extend([0.5, 0.5])
    
    center_top_idx = len(vertices) // 3
    vertices.extend([0, CAN_HEIGHT, 0])
    normals.extend([0, 1, 0])
    uvs.extend([0.5, 0.5])
    
    # Bottom cap triangles
    for i in range(SEGMENTS):
        angle1 = (i / SEGMENTS) * 2 * math.pi
        angle2 = ((i + 1) / SEGMENTS) * 2 * math.pi
        
        idx1 = len(vertices) // 3
        vertices.extend([math.cos(angle1) * CAN_RADIUS, 0, math.sin(angle1) * CAN_RADIUS])
        normals.extend([0, -1, 0])
        uvs.extend([0.5 + 0.5 * math.cos(angle1), 0.5 + 0.5 * math.sin(angle1)])
        
        idx2 = len(vertices) // 3
        vertices.extend([math.cos(angle2) * CAN_RADIUS, 0, math.sin(angle2) * CAN_RADIUS])
        normals.extend([0, -1, 0])
        uvs.extend([0.5 + 0.5 * math.cos(angle2), 0.5 + 0.5 * math.sin(angle2)])
        
        indices.extend([center_bottom_idx, idx2, idx1])
    
    # Top cap triangles
    for i in range(SEGMENTS):
        angle1 = (i / SEGMENTS) * 2 * math.pi
        angle2 = ((i + 1) / SEGMENTS) * 2 * math.pi
        
        idx1 = len(vertices) // 3
        vertices.extend([math.cos(angle1) * CAN_RADIUS, CAN_HEIGHT, math.sin(angle1) * CAN_RADIUS])
        normals.extend([0, 1, 0])
        uvs.extend([0.5 + 0.5 * math.cos(angle1), 0.5 + 0.5 * math.sin(angle1)])
        
        idx2 = len(vertices) // 3
        vertices.extend([math.cos(angle2) * CAN_RADIUS, CAN_HEIGHT, math.sin(angle2) * CAN_RADIUS])
        normals.extend([0, 1, 0])
        uvs.extend([0.5 + 0.5 * math.cos(angle2), 0.5 + 0.5 * math.sin(angle2)])
        
        indices.extend([center_top_idx, idx1, idx2])
    
    return vertices, normals, uvs, indices

def create_glb(vertices, normals, uvs, indices):
    """Create a GLB file from geometry data"""
    
    # Convert to binary buffers
    vertex_buffer = struct.pack(f'{len(vertices)}f', *vertices)
    normal_buffer = struct.pack(f'{len(normals)}f', *normals)
    uv_buffer = struct.pack(f'{len(uvs)}f', *uvs)
    index_buffer = struct.pack(f'{len(indices)}H', *indices)
    
    # Combine all buffers
    buffer_data = vertex_buffer + normal_buffer + uv_buffer + index_buffer
    buffer_length = len(buffer_data)
    
    # Calculate bounds for vertices
    vertex_count = len(vertices) // 3
    min_vals = [min(vertices[i::3]) for i in range(3)]
    max_vals = [max(vertices[i::3]) for i in range(3)]
    
    # Create glTF JSON structure
    gltf = {
        "asset": {"version": "2.0", "generator": "Python GLB Generator"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0}],
        "meshes": [{
            "primitives": [{
                "attributes": {
                    "POSITION": 0,
                    "NORMAL": 1,
                    "TEXCOORD_0": 2
                },
                "indices": 3,
                "material": 0
            }]
        }],
        "materials": [{
            "pbrMetallicRoughness": {
                "baseColorFactor": [0.9, 0.9, 0.9, 1.0],
                "metallicFactor": 0.9,
                "roughnessFactor": 0.1
            },
            "name": "AluminumCan"
        }],
        "buffers": [{"byteLength": buffer_length}],
        "bufferViews": [
            {"buffer": 0, "byteOffset": 0, "byteLength": len(vertex_buffer), "target": 34962},
            {"buffer": 0, "byteOffset": len(vertex_buffer), "byteLength": len(normal_buffer), "target": 34962},
            {"buffer": 0, "byteOffset": len(vertex_buffer) + len(normal_buffer), "byteLength": len(uv_buffer), "target": 34962},
            {"buffer": 0, "byteOffset": len(vertex_buffer) + len(normal_buffer) + len(uv_buffer), "byteLength": len(index_buffer), "target": 34963}
        ],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": vertex_count, "type": "VEC3", "min": min_vals, "max": max_vals},
            {"bufferView": 1, "componentType": 5126, "count": vertex_count, "type": "VEC3"},
            {"bufferView": 2, "componentType": 5126, "count": vertex_count, "type": "VEC2"},
            {"bufferView": 3, "componentType": 5123, "count": len(indices), "type": "SCALAR"}
        ]
    }
    
    # Convert JSON to bytes
    json_data = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    json_length = len(json_data)
    json_padding = (4 - (json_length % 4)) % 4
    json_data += b' ' * json_padding
    json_length += json_padding
    
    # Add buffer padding
    buffer_padding = (4 - (buffer_length % 4)) % 4
    buffer_data += b'\x00' * buffer_padding
    buffer_length += buffer_padding
    
    # Create GLB file
    total_length = 12 + 8 + json_length + 8 + buffer_length
    
    glb = bytearray()
    glb.extend(struct.pack('<I', 0x46546C67))  # Magic: 'glTF'
    glb.extend(struct.pack('<I', 2))  # Version
    glb.extend(struct.pack('<I', total_length))  # Total length
    glb.extend(struct.pack('<I', json_length))  # JSON chunk length
    glb.extend(struct.pack('<I', 0x4E4F534A))  # JSON chunk type: 'JSON'
    glb.extend(json_data)
    glb.extend(struct.pack('<I', buffer_length))  # Buffer chunk length
    glb.extend(struct.pack('<I', 0x004E4942))  # Buffer chunk type: 'BIN\0'
    glb.extend(buffer_data)
    
    return bytes(glb)

def main():
    print("Generating procedural 12oz aluminum can GLB...")
    vertices, normals, uvs, indices = create_cylinder_geometry()
    print(f"Generated {len(vertices)//3} vertices, {len(indices)//3} triangles")
    
    glb_data = create_glb(vertices, normals, uvs, indices)
    
    output_path = "/home/ubuntu/packaging-configurator-3d/client/public/assets/models/12oz_can.glb"
    with open(output_path, 'wb') as f:
        f.write(glb_data)
    
    print(f"GLB file saved to: {output_path}")
    print(f"File size: {len(glb_data)} bytes")

if __name__ == "__main__":
    main()
