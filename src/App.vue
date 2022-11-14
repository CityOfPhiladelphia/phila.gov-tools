<template>
  <div id="programs">

    <h1>Tools</h1>

    <h2>Featured Tools</h2>

    <div id="programs-display">
      <div id="tiles">
        <div class="medium-12 cell mbl program-wrap">
          <a
            class="card program-card"
          >
            test
          </a>
        </div>
      </div>
    </div>

    <div class="search">
      <input
        id="search-bar"
        v-model="search"
        class="search-field"
        type="text"
        placeholder="Search by title or keyword"
      ><input
        ref="archive-search-bar"
        type="submit"
        class="search-submit"
        value="Search"
      >
      <button
        v-if="search.length > 0"
        class="clear-search-btn"
        @click="clearSearchBar"
      >
        <i class="fas fa-times " />
      </button>
    </div>
    <div
      id="programs-container"
    >
      <div id="filters-container">
        <div
          class="accordion"
        >
          <!-- <div
            class="accordion-item"
            :class="{'is-active' : showAudiences}"
            @click="toggleAudiences"
          >
            <div
              tabindex="0"
              class="h4 accordion-title mbn"
            >
              Filter by audience
            </div>
          </div>
          <div
            v-show="showAudiences"
            class="acc-content"
          >
            <div
              v-for="(value, key) in audiences"
              :key="key"
              class="accordion-checkbox"
            >
              <input
                :id="value.slug"
                v-model="checkedAudiences"
                type="checkbox"
                :value="value.slug"
                :name="value.slug"
                class="hidden-checkbox"
                @change="filterResults"
              >
              <label

                :for="value.slug"
                class="program-audience"
              >{{ value.name }}</label>
            </div>
          </div> -->

          <div
            class="accordion-item"
            :class="{'is-active' : showTopics}"
            @click="toggleServices"
          >
            <div
              tabindex="0"
              class="h4 accordion-title"
            >
              Filter by topic
            </div>
          </div>
          <div
            v-show="showTopics"
            class="acc-content"
          >
            <fieldset>
              <div
                v-for="(value, key) in topics"
                :key="key"
                class="accordion-checkbox"
              >
                <input
                  :id="value.slug"
                  v-model="checkedTopics"
                  type="checkbox"
                  class="hidden-checkbox"
                  :value="value.slug"
                  :name="value.slug"
                  @click="filterResults"
                >
                <label
                  :for="value.slug"

                  class="program-category"
                ><span v-html="value.name" /></label>
              </div>
            </fieldset>
          </div>
        </div>
        <div>
          <button
            class="clear-button"
            @click="clearAllFilters()"
          >
            Clear all Filters
          </button>
        </div>
      </div>

      <div id="programs-display">
        <div
          v-show="loading"
          class="mtm center"
        >
          <i class="fas fa-spinner fa-spin fa-3x" />
        </div>

        <div
          v-show="!loading && emptyResponse"
          class="h3 mtm center"
        >
          Sorry, there are no results.
        </div>

        <div
          v-show="failure"
          class="h3 mtm center"
        >
          Sorry, there was a problem. Please try again.
        </div>

        <div id="tiles">
          <paginate

            v-if="filteredPrograms.length > 0 "
            id="program-results"
            ref="paginator"
            name="filteredPrograms"
            :list="filteredPrograms"
            class="grid-x grid-margin-x paginate-list"
            tag="div"
            :per="8"
          >
            <div
              v-for="program in paginated('filteredPrograms')"
              :key="program.title"
              class="medium-12 cell mbl program-wrap"
            >
              <a
                class="card program-card"
                :href="program.link"
              >
                <div class="trim"><img
                  :src="program.image"
                  alt=""
                  class="program-image"
                ></div>
                <div class="content-block">
                  <!-- <h3 :class="{ 'external' : program.link.includes('http') }">{{ program.title }}</h3> -->
                  <h3>{{ program.title }}</h3>
                  <p>{{ program.short_description }}</p>
                </div>
              </a>
            </div>
          </paginate>

          <div class="program-pages">
            <div
              v-show="!loading && !emptyResponse && !failure"
              class="program-length"
            >
              Showing <b> {{ filteredPrograms.length }} </b> programs.
            </div>

            <paginate-links
              v-show="!loading && !emptyResponse && !failure"
              for="filteredPrograms"
              :async="true"
              :limit="3"
              :show-step-links="true"
              :hide-single-page="true"
              :step-links="{
                next: 'Next',
                prev: 'Previous'
              }"
              @change="onPageChange(); scrollToTop(); "
            />
          </div>
          <div
            v-show="showRelated && relatedServices.length > 0"
            id="related-services"
            class="grid-x grid-margin-x grid-padding-x"
          >
            <div class="medium-24 cell">
              <h3 class="black bg-ghost-gray phm-mu mtl mbm">
                Related services
              </h3>
              <ul class="phm-mu">
                <li
                  v-for="relatedService in relatedServices"
                  :key="relatedService.id"
                >
                  <a :href="relatedService.link">{{ relatedService.name }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

import Vue from "vue";
import axios from "axios";
import VueFuse from "vue-fuse";
import VuePaginate from "vue-paginate";

Vue.use(VueFuse);
Vue.use(VuePaginate);

const programsEndpoint = 'https://api.airtable.com/v0/appPVX1yJCVtJhklp/tools?api_key=keyZ84hQSumaKJOhi';
const audienceEndpoint = 'https://api.phila.gov/phila/audience';
const topicsEndpoint = 'https://api.airtable.com/v0/appPVX1yJCVtJhklp/topics?api_key=keyZ84hQSumaKJOhi';
const serviceTypeEndpoint = 'https://api.phila.gov/phila/service/types';
const relatedServicesEndpoint =  'http://api.phila.gov/phila/program/related-services';


export default {
  name: "Programs",
  components: {

  },
  filters: {

  },
  data: function() {
    return {
      programs: [],
      filteredPrograms: [],
      search: '',
      routerQuery: {},
      paginate: [ 'filteredPrograms' ],
      audiences: [],
      topics: [],
      checkedAudiences: [],
      checkedTopics: [],
      serviceTypes: [],
      checkedServiceTypes: [],
      relatedServices: [],
      page: 1,
      servicePrograms: [],
      audiencePrograms: [],
      topicPrograms: [],
      showTopics: true,
      showAudiences: true,
      showServices: true,
      showRelated : false,
      loading: true,
      emptyResponse: false,
      failure: false,
      searchOptions: {
        shouldSort: true,
        threshold: 0.4,
        tokenize: true,
        keys: [
          'title',
          'short_description',
        ],
      },
    };
  },
  computed: {

  },

  watch: {

    routerQuery: {
      handler: function () {
        console.log('watch routerQuery is firing');
        this.updateRouter();
      },
      deep: true,
    },

    search(value) {
      console.log('watch search is running, value:', value);
      this.filterResults();
      if (value.length > 3) {
        this.updateRouterQuery('search', value);
      } else {
        this.updateRouterQuery('search', null);
      }

    },

    filteredPrograms(val) {
      console.log('watch filteredPrograms is firing, val:', val);
      if (val.length === 0) {
        this.getRelatedServices();
        this.showRelated = true;
      } else {
        this.showRelated = false;
      }
    },

    checkedAudiences(val) {
      console.log('watch checkedAudiences is firing, val:', val, 'and will call filterResults and updateRouterQuery');
      this.filterResults();
      this.updateRouterQuery('checkedAudiences', val);

    },
    checkedTopics(val) {
      console.log('watch checkedTopics is firing, val:', val, 'and will call filterResults and updateRouterQuery');
      this.filterResults();
      this.updateRouterQuery('checkedTopics', val);

    },
    checkedServiceTypes (val) {
      console.log('watch checkedServiceTypes is firing, val:', val, 'and will call filterResults and updateRouterQuery');
      this.filterResults();
      this.updateRouterQuery('checkedServiceTypes', val);

    },
    loading(val) {
      console.log('watch loading is firing');
      if(!val) {
        this.initFilters();
        this.filterResults();
      }
    },

  },

  mounted: function() {
    this.getAllPrograms();
    this.getAllAudiences();
    this.getAllTopics();
    this.getAllServices();
  },

  methods: {
    getAllPrograms: function () {
      console.log('getAllPrograms is running');
      axios
        .get( programsEndpoint , {
          params: {
            'count': -1,
          }})
        .then(response => {
          for (let record of response.data.records) {
            this.programs.push(record.fields);
            this.filteredPrograms.push(record.fields);
          }
        })
        .catch(e => {})
        .finally(() => {

          this.loading = false;
        });
    },
    getAllTopics: function () {
      console.log('getAllTopics is running');
      axios
        .get( topicsEndpoint , {
          params: {
            'count': -1,
          }})
        .then(response => {
          for (let record of response.data.records) {
            this.topics.push(record.fields);
          }
        })
        .catch(e => {})
        .finally(() => {});
    },

    getAllServices: function () {
      console.log('getAllServices is running');
      axios
        .get(serviceTypeEndpoint, {
          params: {
            'per_page': 30,
          }})
        .then(response => {
          this.serviceTypes = response.data;
        })
        .catch(e => {})
        .finally(() => {

        });
    },

    getAllAudiences: function () {
      console.log('getAllAudiences is running');
      axios
        .get( audienceEndpoint , {
          params: {
            'count': -1,
          }})
        .then(response => {
          this.audiences = response.data;
        })
        .catch(e => {})
        .finally(() => {});
    },

    getRelatedServices: function () {
      console.log('getRelatedServices is running');

      let params = {
        count: '50',
        'audience' : this.checkedAudiences,
        'service_type': this.checkedServiceTypes,
      };

      axios.get( relatedServicesEndpoint, { params })
        .then(response => {
          this.relatedServices = response.data;
        })
        .catch(e => {
        });
    },

    filterResults: async function () {
      console.log('filterResults is running');
      await this.filterByServiceType();
      await this.filterByAudience();
      await this.filterByTopic();
      await this.filterBySearch();
      await this.checkEmpty();
    },

    filterByAudience: function() {
      console.log('filterByAudience is running');
      if (this.checkedAudiences.length !== 0 ){
        this.audiencePrograms = [];

        this.servicePrograms.forEach((program) => {
          program.audiences.forEach((audience) => {
            if (this.checkedAudiences.includes(audience.slug)) {
              if (!this.audiencePrograms.includes(program)) {
                this.audiencePrograms.push(program);
              }
            }
          });
        });
      } else {
        this.audiencePrograms = this.servicePrograms;
      }
    },

    filterByTopic: function() {
      console.log('filterByTopic is running');
      if (this.checkedTopics.length !== 0 ){

        this.topicPrograms = [];

        this.servicePrograms.forEach((program) => {
          console.log('in forEach servicePrograms, program.topic:', program.topic);
          // program.topics.forEach((topic) => {
          if (this.checkedTopics.includes(program.topic)) {
            if (!this.topicPrograms.includes(program)) {
              this.topicPrograms.push(program);
            }
          }
          // });
        });
      } else {
        this.topicPrograms = this.servicePrograms;
      }
    },

    filterBySearch: function() {
      console.log('filterBySearch is running');
      if (this.search) {
        this.$search(this.search, this.topicPrograms, this.searchOptions).then(programs => {
          this.filteredPrograms = programs;
        });
      } else {
        this.filteredPrograms = this.topicPrograms;
      }

    },

    filterByServiceType: function() {
      console.log('filterByServiceType is running');
      if (this.checkedServiceTypes.length !== 0 ){
        this.servicePrograms = [];

        this.programs.forEach((program) => {

          program.services.forEach((serviceType) => {
            if (this.checkedServiceTypes.includes(serviceType.slug)) {
              if (!this.servicePrograms.includes(program)) {
                this.servicePrograms.push(program);
              }
            }
          });
        });
      } else {
        this.servicePrograms = this.programs;
      }
    },

    toggleAudiences: function() {
      console.log('toggleAudiences is running');
      this.showAudiences = this.showAudiences ? false : true;
    },

    toggleServices: function() {
      console.log('toggleServices is running');
      this.showServices = this.showServices ? false : true;
    },

    updateRouterQuery: function (key, value) {
      console.log('updateRouterQuery is running');
      if (typeof value === 'undefined' || value === '' || value === null) {
        Vue.delete(this.routerQuery, key);
      } else {
        Vue.set(this.routerQuery, key, value);
      }
    },

    clearSearchBar: function () {
      console.log('clearSearchBar is running');
      this.search = "";
    },

    /**
    * @desc scrolls to top from paginate buttons
    */
    scrollToTop : function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },

    checkEmpty: function() {
      console.log('checkEmpty is running');
      this.emptyResponse = (this.filteredPrograms.length === 0 ) ? true : false;
    },

    resetRouterQuery: function () {
      console.log('resetRouterQuery is running');
      for (let routeKey in this.$route.query) {
        Vue.delete(this.routerQuery, routeKey);
      }
    },

    initFilters: function() {
      console.log('initFilters is running');
      if (Object.keys(this.$route.query).length !== 0) {
        for (let routerKey in this.$route.query) {
          if(routerKey === "checkedServiceTypes" || routerKey === "checkedAudiences"){
            Vue.set(this, routerKey, this.returnArray(this.$route.query[routerKey]));
          } else {
            Vue.set(this, routerKey, this.$route.query[routerKey]);
          }
        }
        this.setPage();
      }


    },

    returnArray (value) {
      if (Array.isArray(value)) {
        return value;
      }
      if (value !== '') {
        return [ value ];
      }
      return [];
    },

    updateRouter: function () {
      console.log('updateRouter is running');
      if (this.routerQuery  === this.$route.query) {
        return;
      }
      this.$router.push({
        name: 'main',
        query: this.routerQuery,
      }).catch(e => {
        // window.console.log(e);
      });
    },

    onPageChange() {
      console.log('onPageChange is running');
      let newPage = this.$refs.paginator.currentPage + 1;
      this.page = newPage;
      this.updateRouterQuery('page', newPage);
    },

    setPage: function() {
      console.log('setPage is running');
      if (this.page) {
        this.$refs.paginator.goToPage(this.page);
      }
    },

    clearAllFilters() {
      console.log('clearAllFilters is running');
      this.checkedAudiences = [];
      this.checkedServiceTypes = [];
      this.search = '';
      this.page = 1;
    },
  },
};
</script>

<style lang="scss">

#programs {
  margin: 0 auto;
  max-width: 75rem;
  padding: 0px 10px 0px 10px;

   .clear-search-btn {
      position: absolute;
      top:16px;
      right: 70px;
      padding: 0;
      font-size: 20px;
      background-color: #fff;
      opacity: 0.8;
      z-index: 999;
      cursor: pointer;
      color: rgba(60, 60, 60, 0.5);

    }

  #programs-container {
    display: flex;

    #filters-container {
      width: 33%;
      padding-right: 2rem;

      .accordion-title {
        font-weight: bold;
      }

      .acc-content {
        background-color: white;
        padding: 1rem;

        .accordion-checkbox {

          user-select: none;

          input[type="checkbox"]:focus + label {
            border:2px solid black;
          }

          .hidden-checkbox {
            display: block;
            opacity: 1;         // hide it visually
            z-index: -1;        // avoid unintended clicks
            position: absolute; // don't affect other elements positioning
          }


        }
      }

      .clear-button {
        margin: 0 auto;
      }
    }

    #programs-display {
      width: 66%;

      .program-wrap {
        min-height: 353px;
      }

      .trim {
        max-height: 188px;
        overflow: hidden;
      }
    }
  }

  .program-pages {
    display: flex;
    justify-content: space-between;
  }

    @media (max-width: 760px) {

      .search {
        width: 95%;
        margin: 0 auto;
      }

      #programs-container {
        flex-direction: column;

        #filters-container {
          width: 95%;
          margin: 0 auto;
          padding:0 0 1rem 0
        }

        #programs-display {
          width: 95%;
          margin: 0 auto;
        }
      }
    }

}

</style>
