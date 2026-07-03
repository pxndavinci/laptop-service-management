import serviceOrderComposerRepo from '../src/repos/service-order-composer.repo';

async function run() {
  try {
    const results = await serviceOrderComposerRepo.searchComposer({ contactNumber: '987', limit: 3 });
    console.log('OK', results.length);
    console.log(results.slice(0,3));
  } catch (err) {
    console.error('ERR', err);
    process.exit(1);
  }
  process.exit(0);
}

run();
