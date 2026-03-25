declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    isConnected: boolean | null;
  }
  const NetInfo: {
    addEventListener: (listener: (state: NetInfoState) => void) => () => void;
    fetch: () => Promise<NetInfoState>;
  };
  export default NetInfo;
}
