'use client';

import ProductsCarousel from './product/ProductsCarousel';

export default function GoodProducts({ products, title, titleHighlight }) {
  return(
    <div className=''>
      <ProductsCarousel products={products} title={title} titleHighlight={titleHighlight} />
    </div>
  )
}