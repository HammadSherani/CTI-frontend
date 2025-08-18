'use client';

import ProductsCarousel from './product/ProductsCarousel';

export default function SellingProducts({ products, title }) {
  return(
    <div className='max-w-7xl mx-auto'>
      <ProductsCarousel products={products} title={title} />
    </div>
  )
}