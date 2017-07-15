
function xx() {
  return new Promise((resolve, reject) => {
    return reject('xxx');
  });
}

async function start () {
  try {
    await xx();
  } catch (error) {
    console.log('hi', error);
  }
}

start();
