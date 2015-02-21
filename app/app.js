import { AppController } from './components/app/app'

angular.module('app', [
    'ngNewRouter',
    'app.home',
    'app.dashboard',
    'app.dashboard.lessons',
    'app.dashboard.results'
])
    .controller('AppController', AppController);

import { HomeController } from './components/home/home'

angular.module('app.home', [])
    .controller('HomeController', HomeController);

import { DashboardController } from './components/dashboard/dashboard'

angular.module('app.dashboard', [])
    .controller('DashboardController', DashboardController);

import { ResultsController } from './components/dashboard/results/results'

angular.module('app.dashboard.results', [])
    .controller('ResultsController', ResultsController);

import { LessonsController } from './components/dashboard/lessons/lessons'

angular.module('app.dashboard.lessons', [])
    .controller('LessonsController', LessonsController);
