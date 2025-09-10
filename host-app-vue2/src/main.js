import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './plugins/i18n';
import { init } from '@module-federation/runtime';
import { EventBus } from './plugins/eventBus';
import { createStoreAdapter } from './store/store-adapter';
import * as Sentry from '@sentry/vue';

console.log('USER_APP_URL:', process.env.USER_APP_URL);


Vue.prototype.$eventBus = EventBus;

// This step configures the environment to understand and load remote modules.
init({
  name: 'hostApp',
  remotes: [
    {
      name: 'userAppVue3',
      entry: `${process.env.USER_APP_URL}/remoteEntry.js`,

    },
    {
      name: 'editUserAppVue3',
      entry: `${process.env.EDIT_USER_APP_URL}/remoteEntry.js`,

    },
  ],
});

Vue.config.productionTip = false;

// Initialize Sentry before creating the Vue app
Sentry.init({
  dsn: 'https://32c56583f44fe6b590bb747a7a5f16ab@o4509507613425664.ingest.us.sentry.io/4509507615391744',
  integrations: [
    Sentry.vueIntegration({
      Vue: Vue, // Pass the Vue constructor for Vue 2
      tracingOptions: {
        trackComponents: true,
      },
    }),
    Sentry.browserTracingIntegration(),
  ],
  // Increase sample rates for testing
  tracesSampleRate: 1.0, // 100% for testing
  environment: process.env.NODE_ENV || 'development',
  debug: true, // Enable debug mode to see console logs
  beforeSend(event) {
    console.log('Sentry: Sending event to Sentry:', event);
    return event;
  }
});

// Test that Sentry is working
console.log('Sentry initialized successfully');

// Add a test error function to global scope for testing
window.testSentryError = function() {
  console.log('Triggering test error for Sentry...');
  Sentry.captureException(new Error('Test error from Sentry integration'));
};

// Add a test message function
window.testSentryMessage = function() {
  console.log('Sending test message to Sentry...');
  Sentry.captureMessage('Test message from Sentry integration', 'info');
};

// Create the store adapter instance.
// This instance will bridge the Vuex store to Vue 3 remote applications,
// making it reactive for them and providing action dispatchers.
const storeAdapter = createStoreAdapter(store, EventBus);

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
  // Provide the store adapter, EventBus, router, and i18n to all child components,
  provide() {
    return {
      storeAdapter: storeAdapter,
      eventBus: EventBus,
      i18n: {
        t: i18n.t.bind(i18n),
        locale: i18n.locale,
      },
      hostRouter: {
        push: router.push.bind(router),
        replace: router.replace.bind(router),
        currentRoute: router.currentRoute
      },
    };
  },
  mounted() {
    this.$store.dispatch('fetchUsers');

    EventBus.$on('storeUpdated', () => {
      console.log('Host App: Store updated event received!');
    });

    EventBus.$on('remote:updateUser', async ({ id, userData, callback }) => {
      console.log('Host App: Received remote:updateUser event', { id, userData });
      try {
        await this.$store.dispatch('updateUser', { id, userData });
        if (callback) callback({ success: true });
        console.log('Host App: User updated successfully after remote request.');
      } catch (error) {
        console.error('Host App: Error updating user from remote request:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    EventBus.$on('remote:addUser', async ({ userData, callback }) => {
      console.log('Host App: Received remote:addUser event', { userData });
      try {
        await this.$store.dispatch('addUser', userData);
        if (callback) callback({ success: true });
        console.log('Host App: User added successfully after remote request.');
      } catch (error) {
        console.error('Host App: Error adding user from remote request:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    EventBus.$on('remote:deleteUser', async ({ userId, callback }) => {
      console.log('Host App: Received remote:deleteUser event for ID:', userId);
      try {
        await this.$store.dispatch('deleteUser', userId);
        if (callback) callback({ success: true });
        console.log('Host App: User deleted successfully after remote request.');
      } catch (error) {
        console.error('Host App: Error deleting user from remote request:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });
  },
}).$mount('#app');
