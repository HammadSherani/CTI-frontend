'use client';

import ProductsCarousel from './product/ProductsCarousel';

export default function SellingProducts({ products, title,titleHighlight }) {
  return(
    <div className=''>
      <ProductsCarousel products={products} title={title} titleHighlight={titleHighlight} />
    </div>
  )
}