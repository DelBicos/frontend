import useServicesStore from '@stores/Services/Services';

export default function useServicesLastQuery() {
  return useServicesStore((s) => s.lastQuery);
}
