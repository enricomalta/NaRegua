import { useCallback, useEffect, useRef, useState } from "react"

/**
 * useGeolocation - Hook para solicitar permissão de localização e obter coordenadas.
 * Retorna o estado da permissão, posição atual, possíveis erros e ações para (re)solicitar.
 *
 * Observações importantes:
 * - A API de Geolocation só funciona em conexões seguras (https) exceto em localhost.
 * - O navegador controla quando e como o prompt aparece; chamar `request()` dispara a tentativa.
 */
export type GeoPosition = {
  latitude: number
  longitude: number
  accuracy?: number
}

export type GeoPermissionState = "granted" | "denied" | "prompt" | "unsupported" | "unknown"

export function useGeolocation(options?: PositionOptions) {
  const [permission, setPermission] = useState<GeoPermissionState>("unknown")
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const watchId = useRef<number | null>(null)

  // Tenta ler o estado atual da permissão, quando a API Permissions estiver disponível
  const readPermissionState = useCallback(async () => {
    if (typeof navigator === "undefined" || !("permissions" in navigator)) {
      // browsers antigos ou ambiente sem navigator.permissions
      setPermission("prompt")
      return
    }

    try {
      // name: 'geolocation' é suportado na maioria dos navegadores modernos
      // cast necessário por causa das definições TS que podem ser restritas
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const status = await navigator.permissions.query({ name: "geolocation" })
      setPermission((status.state as GeoPermissionState) || "unknown")
      // atualiza quando o usuário muda a permissão (ex.: via UI do browser)
      status.onchange = () => setPermission((status.state as GeoPermissionState) || "unknown")
    } catch (e) {
      // se falhar, assume prompt (irá disparar quando chamar getCurrentPosition)
      setPermission("prompt")
    }
  }, [])

  useEffect(() => {
    readPermissionState()
  }, [readPermissionState])

  // Solicita a localização uma vez (getCurrentPosition) ou começa a observar (watchPosition)
  const request = useCallback(
    (watch = false) => {
      if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
        setError("Geolocation API não suportada no navegador")
        setPermission("unsupported")
        return Promise.reject(new Error("Geolocation API not available"))
      }

      setLoading(true)
      setError(null)

      return new Promise<GeoPosition>((resolve, reject) => {
        const success = (pos: GeolocationPosition) => {
          const coords: GeoPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }
          setPosition(coords)
          setLoading(false)
          setPermission("granted")
          resolve(coords)
        }

        const fail = (err: GeolocationPositionError) => {
          setLoading(false)
          setError(err.message)
          // Algumas mensagens vêm como strings técnicas, normalizamos um pouco
          if (err.code === err.PERMISSION_DENIED) {
            setPermission("denied")
          }
          reject(err)
        }

        try {
          if (watch) {
            const id = navigator.geolocation.watchPosition(success, fail, options)
            watchId.current = id
          } else {
            navigator.geolocation.getCurrentPosition(success, fail, options)
          }
        } catch (e) {
          setLoading(false)
          setError((e as Error).message || String(e))
          reject(e)
        }
      })
    },
    [options],
  )

  const stop = useCallback(() => {
    if (watchId.current != null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }, [])

  // cleanup
  useEffect(() => {
    return () => stop()
  }, [stop])

  return {
    permission,
    position,
    error,
    loading,
    request,
    stop,
  }
}

export default useGeolocation
