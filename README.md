# Test

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## About

This is our Angular frontend application for our flight tracker. It receives data from the consumer backend application and uses that data to display flight locations, no-fly-zones, flight paths, and flight information. In future releases, it will show information on if a flight is predicted to intersect with a no-fly-zone, whether it has already intersected a no-fly-zone, and new flight routes towards the nearest airport if a plane is is at risk of entering a no-fly-zone.

## Release Notes

Milestone 2: User interface has been revamped to remove the topbar and its unnecessary features, meaning users no longer need to scroll between the topbar and view to use the application. Kubernetes configuration has been completed following the dockerization of all 3 applications, including the frontend. Flight and no-fly-zone data injection now produce visualizations of flights and no-fly-zones on the globe, with an overlaid list showing the names of all objects currently on the globe. Mock flight data is located in our utilities repository, minimizing reliance on a live API for development and reducing development costs. Full flight route visualization is complete, including predictive flight route analysis, but is not yet integrated into the simulation controller. Frontend application can be run by itself using the `ng serve` command.

## Versions 

Milestone 1:  
Apache Kafka has been configured  
SonarQube has been configured  
Application code coverage increased by 10%  
Flight tracker connected to FAA no-fly-zone announcements  
Milestone 2:  
Work has started revamping user interface  
Application code coverage increased by 10%  
Mock data captured for testing and development  
Milestone 3:  
System warns user of possible no-fly-zone collisions  
Configuration of Kubernetes cluster has begun  
Application allows visualization of full flight route  
Milestone 4:  
Predictive flight analysis complete  
Flight paths updated after interaction with no-fly-zone  
New application UI completed  
Application has been deployed to Kubernetes cluster  
Milestone 5:  
75% test coverage reached  
UI more intuitive and consistent  
bug fixes and stability improvements  
