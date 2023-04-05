# ExtranetFrontEntrega

Repositorio de intercambio para la entrega de codigo Front.

# PrevingExtranetFront

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Despliegue (GKE)

#### 1. Integración desarrollo

Mergeamos la rama de desarrollo o de pre producción sobre master / demo.

#### 2. Generación de distribución

Una vez mergeado el desarrollo compilamos:

```
ng build --aot --prod
```

#### 3. Generación de imagen docker a desplegar

Con Docker Desktop iniciado generamos la imagen con el siguiente comando (posicionándonos en el mismo directorio en el que está el fichero Dockerfile):

Demo:
```
docker build -t grupopreving/avansis-extranet-front-demo:20221103v1 . --no-cache 
```

Prod:

```
docker build -t grupopreving/extranet-front-prod:20221103v1 . --no-cache 
```

Indicamos el nombre de la imagen (`grupopreving/extranet-front-prod`) y su etiqueta (fecha en formato yyyymmdd + versión: `20221103v1`)

#### 4. Subimos la imagen al repositorio de DockerHub

Una vez generada la imagen, la subimos al repositorio con el siguiente comando:

```
docker push grupopreving/extranet-front-prod:20221103v1
```

También existe la posibilidad de subirla con Docker Desktop.

#### 5. Desplegamos la imagen en GKE

Editamos el manifiesto del despliegue (03-deployment-extranet-front.yml) para incluir la misma etiqueta (en el ejemplo: 20221103v1).

Comprobar que estamos en el entorno correspondiente con el comando: 

```
kubectl get ns
```

A continuación, lo aplicamos con el siguiente comando en el namespace `previngcontigo-empresas` (prod) o `extranet-testing` (demo):

Demo:
```
kubectl apply -f 03-deployment-extranet-front.yml -n extranet-testing
```

Prod:
```
kubectl apply -f 03-deployment-extranet-front.yml -n previngcontigo-empresas
```

Podemos seguir en Lens o en la consola de GKE el log del despliegue de la aplicación.

GitLab despliegues: https://gitlab.preving.com/conf-kubernetes/despliegue-kubernetes
