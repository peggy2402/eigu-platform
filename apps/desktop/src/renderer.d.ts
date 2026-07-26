interface ElectronIpcRenderer {
  invoke(channel: string, ...args: any[]): Promise<any>
  on(channel: string, listener: (event: any, ...args: any[]) => void): void
  send(channel: string, ...args: any[]): void
  sendSync(channel: string, ...args: any[]): any
}

interface Window {
  ipcRenderer: ElectronIpcRenderer
}
