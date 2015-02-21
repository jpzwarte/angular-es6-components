class DashboardController {
    constructor($router) {
        $router.config([
            { path: '/',        redirectTo: '/results' },
            { path: '/results', component: 'results' },
            { path: '/lessons', component: 'lessons' }
        ]);
    }
}

DashboardController.$inject = ['$router'];

export { DashboardController }