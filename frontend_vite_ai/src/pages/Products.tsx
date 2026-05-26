import PageTitle from '../components/common/PageTitle';
import SimpleTable from '../components/tables/SimpleTable';
import { products } from '../services/mockData';
export default function Products() {
  return <><PageTitle title='Products' /><SimpleTable headers={['ID','Product','Brand','Stock']} rows={products.map(p=>[p.id,p.name,p.brand,p.stock])} /></>;
}
