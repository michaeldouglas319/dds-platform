import { LOADER_MATERIALS, MaterialKey } from '../loaders/materials.config'

/**
 * Simple store for shared state across loader components
 * Provides matcap texture configuration for CustomMaterial
 */
const store: {
  activeMatcap: MaterialKey
  texture: string
  setMatcap: (key: MaterialKey) => void
} = {
  activeMatcap: 'primary',
  texture: LOADER_MATERIALS.primary.url,
  setMatcap: function (key: MaterialKey) {
    this.activeMatcap = key
    this.texture = LOADER_MATERIALS[key].url
  },
}

export const useStore = (selector: (state: typeof store) => any) => {
  return selector(store)
}

export const setActiveMatcap = (key: MaterialKey) => {
  store.setMatcap(key)
}
