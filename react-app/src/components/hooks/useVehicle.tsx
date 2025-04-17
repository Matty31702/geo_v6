import { useState } from 'react'

const useVehicle = () => {

  // Use loading
  const [loading, setLoading] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  return {
    loading,
    vehicles,
  }
}

export default useVehicle
