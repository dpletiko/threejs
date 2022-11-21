import { Group, BoxGeometry, MeshLambertMaterial, Mesh, CanvasTexture, Vector2 } from 'three'

const createWheels = () => {
  const geometry = new BoxGeometry(12, 12, 33);
  const material = new MeshLambertMaterial({ color: 0x333333 });
  const wheel = new Mesh(geometry, material);

  return wheel;
}

export const createCar = () => {
  const car = new Group();
  
  const backWheel = createWheels();
  backWheel.position.y = 6;
  backWheel.position.x = -18;
  car.add(backWheel);
  
  const frontWheel = createWheels();
  frontWheel.position.y = 6;  
  frontWheel.position.x = 18;
  car.add(frontWheel);

  const length = 60
  const height = 15
  const width = 30
  const bodyPosition = 12

  const main = new Mesh(
    new BoxGeometry(length, height, width),
    new MeshLambertMaterial({ color: 0x78b14b })
  );
  main.position.y = bodyPosition;
  car.add(main);

  const carFrontTexture = getCarFrontTexture();
  const carBackTexture = getCarFrontTexture();
  const carRightSideTexture = getCarSideTexture();

  const carLeftSideTexture = getCarSideTexture();
  carLeftSideTexture.center = new Vector2(0.5, 0.5);
  carLeftSideTexture.rotation = Math.PI;
  carLeftSideTexture.flipY = false;

  const cabin = new Mesh(new BoxGeometry(33, 12, 24), [
    new MeshLambertMaterial({ map: carFrontTexture }),
    new MeshLambertMaterial({ map: carBackTexture }),
    new MeshLambertMaterial({ color: 0xffffff }), // top
    new MeshLambertMaterial({ color: 0xffffff }), // bottom
    new MeshLambertMaterial({ map: carRightSideTexture }),
    new MeshLambertMaterial({ map: carLeftSideTexture }),
  ]);
  cabin.position.x = -6;
  cabin.position.y = 25.5;
  car.add(cabin);

  return car;
}

const getCarFrontTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;

  const context = canvas.getContext("2d")!;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 64, 32);

  context.fillStyle = "#666666";
  context.fillRect(8, 8, 48, 24);

  return new CanvasTexture(canvas);
}

const getCarSideTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;

  const context = canvas.getContext("2d")!;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, 128, 32);

  context.fillStyle = "#666666";
  context.fillRect(10, 8, 38, 24);
  context.fillRect(58, 8, 60, 24);

  return new CanvasTexture(canvas);
}