async function testNextPage() {
  for (const url of ['http://localhost:3000/en/product/iphone-14-pro', 'http://localhost:3000/en/refurbish/some-device']) {
    const res = await fetch(url);
    console.log(url, "Status:", res.status);
  }
}

testNextPage();
