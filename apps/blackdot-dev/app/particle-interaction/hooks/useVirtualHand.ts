'use client';

import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';

interface VirtualHandState {
  handMatrices: Float32Array;
  handPosition: THREE.Vector3;
  palmVelocity: THREE.Vector3;
  isGripping: boolean;
}

const _scaleVector = new THREE.Vector3(1, 1, 1);

export function useVirtualHand(): VirtualHandState {
  const { camera, raycaster, mouse } = useThree();
  const [handMatrices, setHandMatrices] = useState<Float32Array>(
    new Float32Array(16 * 16)
  );
  const [isGripping, setIsGripping] = useState(false);

  const handStateRef = useRef({
    position: new THREE.Vector3(0, 50, 0),
    prevPosition: new THREE.Vector3(0, 50, 0),
    palmVelocity: new THREE.Vector3(0, 0, 0),
    palmMesh: new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 1, 6),
      new THREE.MeshStandardMaterial()
    ),
    fingerBones: Array(15)
      .fill(null)
      .map(() => ({
        bone: new THREE.Mesh(
          (() => {
            const g = new THREE.CylinderGeometry(1, 1, 1, 12, 1);
            g.translate(0, -0.5, 0);
            return g;
          })(),
          new THREE.MeshStandardMaterial()
        ),
        node: new THREE.Mesh(
          new THREE.SphereGeometry(1, 10, 12),
          new THREE.MeshStandardMaterial()
        ),
      })),
    palmOutputAdjustmentMatrix: (() => {
      const q = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        -Math.PI / 2
      );
      q.multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 6)
      );
      return new THREE.Matrix4().makeRotationFromQuaternion(q);
    })(),
    palmMeshAdjustmentQuaternion: new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      Math.PI / 6
    ),
    nodeAdjustmentQuaternion: new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -Math.PI / 2
    ),
    tmpPosition: new THREE.Vector3(),
    tmpQuaternion: new THREE.Quaternion(),
    tmpScale: new THREE.Vector3(),
  });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      handStateRef.current.prevPosition.copy(handStateRef.current.position);
      handStateRef.current.position.copy(intersection);

      handStateRef.current.palmVelocity
        .copy(handStateRef.current.position)
        .sub(handStateRef.current.prevPosition);
    };

    const handleMouseDown = () => setIsGripping(true);
    const handleMouseUp = () => setIsGripping(false);

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);

        handStateRef.current.prevPosition.copy(handStateRef.current.position);
        handStateRef.current.position.copy(intersection);

        handStateRef.current.palmVelocity
          .copy(handStateRef.current.position)
          .sub(handStateRef.current.prevPosition);
      }
    };

    const handleTouchStart = () => setIsGripping(true);
    const handleTouchEnd = () => setIsGripping(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera, raycaster, mouse]);

  useFrame(() => {
    const matrices = new Float32Array(16 * 16);
    const state = handStateRef.current;
    const gripAmount = isGripping ? 1 : 0;

    const palmWidth = 20;
    const palmDepth = 30;
    const palmHeight = 10;

    // Update palm mesh
    const palmMesh = state.palmMesh;
    palmMesh.position.copy(state.position);
    palmMesh.rotation.set(0, 0, 0);
    palmMesh.position.z += 20;
    palmMesh.position.x -= 5;
    palmMesh.quaternion.multiply(state.palmMeshAdjustmentQuaternion);
    palmMesh.scale.set(palmWidth, palmDepth, palmHeight);

    // updateOutputMatrix from Hand.js
    const palmOutputMatrix = new THREE.Matrix4();
    const position = state.tmpPosition;
    const quaternion = state.tmpQuaternion;
    const scale = state.tmpScale;

    palmOutputMatrix.copy(palmMesh.matrixWorld);
    palmOutputMatrix.multiply(state.palmOutputAdjustmentMatrix);

    palmOutputMatrix.decompose(position, quaternion, scale);
    palmOutputMatrix.compose(position, quaternion, _scaleVector);
    palmOutputMatrix.invert();

    // match the sdf primitive sin60
    palmOutputMatrix.elements[3] = scale.x * 0.866025;
    palmOutputMatrix.elements[7] = scale.y * 0.866025;
    palmOutputMatrix.elements[11] = scale.z;

    palmOutputMatrix.toArray(matrices, 0);

    // Finger bones
    for (let finger = 0; finger < 5; finger++) {
      for (let bone = 0; bone < 3; bone++) {
        const matrixIndex = 1 + finger * 3 + bone;
        const fingerBone = state.fingerBones[matrixIndex - 1];
        const boneMesh = fingerBone.bone;
        const nodeMesh = fingerBone.node;

        const fingerCenterX = (finger - 2) * 8;
        const boneLength = [15, 12, 9][bone];
        const boneRadius = [3, 2.5, 2][bone];

        const boneY =
          state.position.y +
          25 +
          [15, 12, 9]
            .slice(0, bone)
            .reduce((sum, l) => sum + l, 0);

        nodeMesh.position.set(
          state.position.x + fingerCenterX,
          boneY,
          state.position.z
        );
        boneMesh.position.set(
          state.position.x + fingerCenterX,
          boneY + boneLength,
          state.position.z
        );
        boneMesh.lookAt(nodeMesh.position);
        nodeMesh.scale.set(boneRadius, boneRadius, boneRadius);
        boneMesh.scale.set(boneRadius, boneLength, boneRadius);
        boneMesh.quaternion.multiply(state.nodeAdjustmentQuaternion);

        if (gripAmount > 0) {
          const curlAngle = gripAmount * (bone + 1) * 0.4;
          const q = new THREE.Quaternion();
          q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), curlAngle);
          boneMesh.quaternion.multiply(q);
        }

        // updateOutputMatrix from FingerBone.js
        const outputMatrix = new THREE.Matrix4();
        outputMatrix.copy(boneMesh.matrixWorld);
        outputMatrix.decompose(position, quaternion, scale);
        outputMatrix.compose(position, quaternion, _scaleVector);
        outputMatrix.invert();

        outputMatrix.elements[3] = scale.x;
        outputMatrix.elements[7] = scale.y;
        outputMatrix.elements[11] = scale.z;

        outputMatrix.toArray(matrices, matrixIndex * 16);
      }
    }

    setHandMatrices(matrices);
  });

  return {
    handMatrices,
    handPosition: handStateRef.current.position,
    palmVelocity: handStateRef.current.palmVelocity,
    isGripping,
  };
}
