import * as THREE from 'three';

const threeChunkRegExp = /\/\/\s?chunk\(\s?(\w+)\s?\);/g;
const glslifyBugFixRegExp = /(_\d+_\d+)(_\d+_\d+)+/g;
const glslifyGlobalRegExp = /GLOBAL_VAR_([^\.\)\;\,\s]+)(_\d+)/g;

function _threeChunkParse(shader: string): string {
  return shader.replace(threeChunkRegExp, _replaceThreeChunkFunc);
}

function _glslifyBugFixParse(shader: string): string {
  return shader.replace(glslifyBugFixRegExp, _returnFirst);
}

function _glslifyGlobalParse(shader: string): string {
  return shader.replace(glslifyGlobalRegExp, _returnFirst);
}

function _replaceThreeChunkFunc(_match: string, chunkName: string): string {
  const chunk = (THREE.ShaderChunk as any)[chunkName];
  if (!chunk) {
    console.warn(`Three.js shader chunk '${chunkName}' not found`);
    // Return empty string instead of comment to avoid shader errors
    return '';
  }
  return chunk + '\n';
}

function _returnFirst(_match: string, first: string): string {
  return first;
}

export function parse(shader: string): string {
  shader = _threeChunkParse(shader);
  shader = _glslifyBugFixParse(shader);
  return _glslifyGlobalParse(shader);
}
