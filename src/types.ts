export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface Face {
  // Original 3D offset vertices relative to the cubelet center
  localVertices: Point3D[];
  // Actual 3D vertices after cubelet rotation & translation
  worldVertices: Point3D[];
  // Screen/Canvas projection of the world vertices
  projectedVertices: Point2D[];
  // RGB or HEX color of the face
  color: string;
  // Identifiers for culling or shading
  normal: Point3D;
  centerZ: number;
}

export interface Cubelet {
  // Current logical center coordinates in space (usually x, y, z are -0.5 or 0.5)
  pos: Point3D;
  // Faces belonging to this small cubelet
  faces: Face[];
}
