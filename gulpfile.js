import express from 'express';
import gulp from 'gulp';
import { copy } from 'fs-extra';
import rimraf from 'rimraf';

const config = {
  src: './static',
  dest: './dist',
  port: 3006,
};

gulp.task('build', done => {
  rimraf(config.dest, () => {
    copy(config.src, config.dest).then(done);
  });
});

gulp.task('serve', () => {
  const app = express();
  app.use(express.static('dist'));
  app.listen(config.port, () => {
    console.log(`Serving assets on port ${config.port}`);
  });
});
