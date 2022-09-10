const SentryCli = require('@sentry/cli');

async function uploadSourcemapsAndRelease() {
  const release = "0.1";
  if (!release) {
    return;
  }
  const cli = new SentryCli();
  try {
    console.log('Creating sentry release ' + release);
    await cli.releases.new(release);

    // uploads already generated source maps by CRA to sentry
    await cli.releases.uploadSourceMaps(release, {
      include: ['build/static/js'],
      urlPrefix: '~/static/js',
      rewrite: false,
    });
    await cli.releases.finalize(release);
  } catch (e) {
    console.error('uploading failed:', e);
  }
}
uploadSourcemapsAndRelease();
