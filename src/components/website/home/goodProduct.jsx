'use client';

import ProductsCarousel from './product/ProductsCarousel';

export default function GoodProducts({ products, title, titleHighlight }) {
  return(
    <div className='overflow-hidden'>
      <ProductsCarousel products={products} title={title} titleHighlight={titleHighlight} />
    </div>
  )
}