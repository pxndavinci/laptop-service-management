import PageTitle from '../components/common/PageTitle';
import SimpleTable from '../components/tables/SimpleTable';
import { customers } from '../services/mockData';
export default function Customers() {
  return <><PageTitle title='Customers' /><SimpleTable headers={['ID','Name','Phone']} rows={customers.map(c=>[c.id,c.name,c.phone])} /></>;
}
