// Utilidades para geolocalização
export interface Coordinates {
  lat: number
  lng: number
}

// Buscar coordenadas por CEP usando API do ViaCEP + Nominatim
export async function getCoordinatesByZipCode(zipCode: string): Promise<Coordinates | null> {
  try {
    // Primeiro, buscar informações do CEP
    const cepResponse = await fetch(`https://viacep.com.br/ws/${zipCode.replace(/\D/g, '')}/json/`)
    
    if (!cepResponse.ok) {
      throw new Error('CEP não encontrado')
    }
    
    const cepData = await cepResponse.json()
    
    if (cepData.erro) {
      throw new Error('CEP inválido')
    }
    
    // Criar endereço para busca
    const address = `${cepData.logradouro}, ${cepData.localidade}, ${cepData.uf}, Brasil`
    
    // Buscar coordenadas usando Nominatim
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    )
    
    const geoData = await geoResponse.json()
    
    if (geoData && geoData.length > 0) {
      return {
        lat: parseFloat(geoData[0].lat),
        lng: parseFloat(geoData[0].lon)
      }
    }
    
    return null
  } catch (error) {
    console.error('Erro ao buscar coordenadas:', error)
    return null
  }
}

// Buscar coordenadas por endereço completo
export async function getCoordinatesByAddress(address: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    )
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }
    
    return null
  } catch (error) {
    console.error('Erro ao buscar coordenadas:', error)
    return null
  }
}

// Buscar informações de endereço por CEP
export async function getAddressByZipCode(zipCode: string) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${zipCode.replace(/\D/g, '')}/json/`)
    
    if (!response.ok) {
      throw new Error('CEP não encontrado')
    }
    
    const data = await response.json()
    
    if (data.erro) {
      throw new Error('CEP inválido')
    }
    
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zipCode: data.cep || ''
    }
  } catch (error) {
    console.error('Erro ao buscar endereço:', error)
    return null
  }
}