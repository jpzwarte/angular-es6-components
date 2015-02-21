class AppController {
    constructor($router) {
        $router.config([
            { path: '/',          component: 'home' },
            { path: '/dashboard', component: 'dashboard' }
        ]);
    }
}

AppController.$inject = ['$router'];

export { AppController }
