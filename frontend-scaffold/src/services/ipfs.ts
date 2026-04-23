export const uploadToIPFS = async (_file: File): Promise<string> => {
  // If we had a real backend or Pinata key:
  // const formData = new FormData();
  // formData.append('file', file);
  // const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', { ... });
  // const data = await res.json();
  // return data.IpfsHash;

  // Mock implementation for test/dev environment
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a dummy hash that resembles an IPFS CID
      const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      resolve(mockHash);
    }, 1000);
  });
};

export const getIPFSUrl = (hashOrUrl: string): string => {
  if (!hashOrUrl) return '';
  if (hashOrUrl.startsWith('http')) return hashOrUrl;
  if (hashOrUrl.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${hashOrUrl.replace('ipfs://', '')}`;
  }
  // Assume it's a direct hash
  return `https://ipfs.io/ipfs/${hashOrUrl}`;
};
