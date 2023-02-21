<template>
  <div
    id="tools"
    class="phila-ui-skin"
  >
    <div class="add-margins-top">
      <h2>Featured tools</h2>
    </div>

    <div class="grid-x">
      <div
        v-for="tool in featuredTools"
        :key="tool.title"
        class="medium-12 cell mbl card-wrap"
      >
        <a
          class="card featured-card"
          :href="tool.link"
        >
          <div class="content-block">
            <i class="fa-regular fa-thumbtack" />
            <span class="featured-label">FEATURED</span>
            <h3>{{ tool.title }}</h3>
            <p>{{ tool.short_description }}</p>
            <div class="content-footer">
              <span class="view-label">View</span>
              <i class="fa-solid fa-angle-right" />
            </div>
          </div>
        </a>
      </div>
    </div>

    <div 
      id="search-bar-label" 
      class="add-margins-top"
    >
      <h2>Browse tools</h2>
    </div>

    <div class="add-margins-search">    
      <div class="search">
        <input
          id="search-bar"
          v-model="search"
          title="search-bar"
          class="search-field"
          type="text"
          placeholder="Search by title or keyword"
        >
        <input
          ref="archive-search-bar"
          type="submit"
          class="search-submit"
          value="Search"
          tabindex="-1"
        >
        <button
          v-if="search.length > 0"
          class="clear-search-btn"
          @click="clearSearchBar"
        >
          <i class="fas fa-times " />
        </button>
      </div>
    </div>

    <div id="main-container">
      <div id="filters-container">
        <div class="accordion">
          <div
            class="accordion-item"
            :class="{'is-active' : showTopics}"
            @click="toggleTopics"
          >
            <div class="h4 accordion-title">
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
                <label :for="value.slug">
                  <span v-html="value.name" />
                </label>
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

      <div id="main-cards-display">
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
            v-if="filteredTools.length > 0 "
            id="tool-results"
            ref="paginator"
            name="filteredTools"
            :list="filteredTools"
            class="grid-x paginate-list"
            tag="div"
            :per="perPage"
          >
            <div
              v-for="tool in paginated('filteredTools')"
              :key="tool.title"
              class="medium-12 large-8 cell mbl card-wrap"
            >
              <a
                class="card app-card"
                :href="tool.link"
              >
                <div class="content-block">
                  <h3>{{ tool.title }}</h3>
                  <p>{{ tool.short_description }}</p>
                  <div class="content-footer">
                    <span class="view-label">View</span>
                    <i class="fa-solid fa-angle-right" />
                  </div>
                </div>
              </a>
            </div>
          </paginate>

          <div class="card-pages">
            <div
              v-show="!loading && !emptyResponse && !failure"
              class="tool-length"
            >
              Showing <b> {{ filteredTools.length }} </b> tools.
            </div>

            <paginate-links
              v-show="!loading && !emptyResponse && !failure"
              for="filteredTools"
              :async="true"
              :limit="3"
              :show-step-links="true"
              :hide-single-page="true"
              :step-links="{
                next: 'Next',
                prev: 'Previous'
              }"
              :classes="{
                '.number': ['number', 'tabbable'],
                '.left-arrow': ['left-arrow', 'tabbable'],
                '.right-arrow': ['right-arrow', 'tabbable'],
              }"
              @change="onPageChange(); scrollToTop(); "
            />
          </div>
        </div>
      </div> <!-- end of #main-cards-display -->
    </div> <!-- end of #main-container -->
  </div>
</template>
<script>

import Vue from "vue";
import axios from "axios";
import VueFuse from "vue-fuse";
import VuePaginate from "vue-paginate";

Vue.use(VueFuse);
Vue.use(VuePaginate);

const toolsEndpoint = 'https://api.airtable.com/v0/appPVX1yJCVtJhklp/tools';
const topicsEndpoint = 'https://api.airtable.com/v0/appPVX1yJCVtJhklp/topics';

import { format } from 'date-fns';

export default {
  name: "Tools",
  components: {

  },
  filters: {

  },
  data: function() {
    return {
      tools: [],
      filteredTools: [],
      featuredTools: [],
      search: '',
      routerQuery: {},
      paginate: [ 'filteredTools' ],
      topics: [],
      checkedTopics: [],
      page: 1,
      topicTools: [],
      showTopics: true,
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
      perPage: 8,
    };
  },
  computed: {
  },

  watch: {

    routerQuery: {
      handler: function () {
        this.updateRouter();
      },
      deep: true,
    },

    search(value) {
      this.filterResults();
      if (value.length > 3) {
        this.updateRouterQuery('search', value);
      } else {
        this.updateRouterQuery('search', null);
      }
    },

    checkedTopics(val) {
      this.filterResults();
      this.updateRouterQuery('checkedTopics', val);
    },

    loading(val) {
      if(!val) {
        this.initFilters();
        this.filterResults();
      }
    },

  },

  async mounted() {
    this.getAllTopics();
    await this.getAllTools();
    this.getFeaturedTools();

    document.querySelectorAll('.tabbable a').forEach(x => {
      x.tabIndex = 0;
      x.addEventListener('keypress', function (event) {
        if (event.keyCode === 13) {
          x.click();
        }
      });
    });

    this.setPerPage();
    addEventListener('resize', (event) => {
      this.setPerPage();
    });
  },

  methods: {
    setPerPage() {
      if (window.innerWidth < 1050) {
        this.perPage = 8;
      } else {
        this.perPage = 9;
      }
    },
    getFeaturedTools() {
      let currentDate = new Date();
      let currentMonth = format(currentDate, 'MMMM');

      // seasonal priority
      for (let tool of this.tools) {
        if (tool.priority_seasonal_value && tool.priority_seasonal_value.includes(currentMonth)) {
          this.featuredTools.push(tool);
        }
      }

      if (this.featuredTools.length > 3) {
        return;
      }

      // new release priority
      for (let tool of this.tools) {
        if (tool.priority_new_release && tool.priority_new_release == 'Yes') {
          this.featuredTools.push(tool);
        }
      }

      // fixed priority
      let fixedLength = 4-this.featuredTools.length;

      for (let i=1; i<=fixedLength; i++) {
        let iTool = this.tools.filter(tool => tool.priority_fixed_value == i)[0];
        this.featuredTools.push(iTool);
      }

      this.featuredTools.sort(function(a, b) {
        if (a.title.toLowerCase() < b.title.toLowerCase()) {
          return -1;
        }
        if (a.title.toLowerCase() > b.title.toLowerCase()) {
          return 1;
        }
        return 0;
      });
    },
    async getAllTools() {
      await axios
        .get( toolsEndpoint , {
          params: {
            'count': -1,
          },
          headers: {
            'Authorization': 'Bearer ' + process.env.VUE_APP_AIRTABLE_ACCESS_TOKEN,
          }
        })
        .then(response => {
          for (let record of response.data.records) {
            this.tools.push(record.fields);
            this.filteredTools.push(record.fields);
          }
          this.tools.sort(function(a, b) {
            if (a.title.toLowerCase() < b.title.toLowerCase()) {
              return -1;
            }
            if (a.title.toLowerCase() > b.title.toLowerCase()) {
              return 1;
            }
            return 0;
          });
          this.filteredTools.sort(function(a, b) {
            if (a.title.toLowerCase() < b.title.toLowerCase()) {
              return -1;
            }
            if (a.title.toLowerCase() > b.title.toLowerCase()) {
              return 1;
            }
            return 0;
          });
        })
        .catch(e => {})
        .finally(() => {

          this.loading = false;
        });
    },
    getAllTopics: function () {
      axios
        .get( topicsEndpoint , {
          params: {
            'count': -1,
          },
          headers: {
            'Authorization': 'Bearer ' + process.env.VUE_APP_AIRTABLE_ACCESS_TOKEN,
          }
        })
        .then(response => {
          for (let record of response.data.records) {
            this.topics.push(record.fields);
          }
          this.topics.sort(function(a, b) {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          });
        })
        .catch(e => {})
        .finally(() => {});
    },
    filterResults: async function () {
      await this.filterByTopic();
      await this.filterBySearch();
      await this.checkEmpty();
    },

    filterByTopic: function() {
      if (this.checkedTopics.length !== 0 ){
        this.topicTools = [];
        this.tools.forEach((tool) => {
          if (this.checkedTopics.includes(tool.category1) || this.checkedTopics.includes(tool.category2)) {
            if (!this.topicTools.includes(tool)) {
              this.topicTools.push(tool);
            }
          }
        });
      } else {
        this.topicTools = this.tools;
      }
    },

    filterBySearch: function() {
      if (this.search) {
        this.$search(this.search, this.topicTools, this.searchOptions).then(tools => {
          this.filteredTools = tools;
        });
      } else {
        this.filteredTools = this.topicTools;
      }
    },

    toggleTopics: function() {
      this.showTopics = this.showTopics ? false : true;
    },

    updateRouterQuery: function (key, value) {
      if (typeof value === 'undefined' || value === '' || value === null) {
        Vue.delete(this.routerQuery, key);
      } else {
        Vue.set(this.routerQuery, key, value);
      }
    },

    clearSearchBar: function () {
      this.search = "";
    },

    /**
    * @desc scrolls to top from paginate buttons
    */
    scrollToTop : function () {
      document.getElementById('search-bar-label').scrollIntoView({
        behavior: 'smooth',
      });
    },

    checkEmpty: function() {
      this.emptyResponse = (this.filteredTools.length === 0 ) ? true : false;
    },

    resetRouterQuery: function () {
      for (let routeKey in this.$route.query) {
        Vue.delete(this.routerQuery, routeKey);
      }
    },

    initFilters: function() {
      if (Object.keys(this.$route.query).length !== 0) {
        for (let routerKey in this.$route.query) {
          if(routerKey === "checkedTopics"){
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
      let newPage = this.$refs.paginator.currentPage + 1;
      this.page = newPage;
      this.updateRouterQuery('page', newPage);
    },

    setPage: function() {
      if (this.page) {
        this.$refs.paginator.goToPage(this.page);
      }
    },

    clearAllFilters() {
      this.checkedTopics = [];
      this.search = '';
      this.page = 1;
    },
  },
};
</script>

<style lang="scss">

.phila-ui-skin {

  padding: 0px;
  margin: 0 auto;
  max-width: 1270px;

  .page-title {
    border-bottom: 12px solid #2176d2;
  }

  .clear-button {
    color: #ffffff;
    background-color: #0F4D90;
    margin: 0 auto;
  }

  a.card.featured-card {
    border-bottom: 5px solid #0F4D90;
  }

  a.card.app-card {
    border-bottom: 0px;
  }

  a.card {
    margin: 1rem;

    h3 {
      font-size: 24px;
    }

    .featured-label {
      font-family: "Montserrat", sans-serif;
      font-size: 14px;
      padding-left: 10px;
    }

    .view-label {
      padding-right: .5rem;
    }

    .content-block {
      padding-left: 1rem;
      padding-right: 1rem;
      padding-top: 1rem;
      padding-bottom: 58px;

      .content-footer {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        color: #0f4d90;
      }
    }  
  }

  a.card:hover {
    background-color: #0F4D90;
    color: #ffffff;
    opacity: 1;

    h3 {
      color: #ffffff;
    }

    .content-footer {
      color: #ffffff;
    }
  }

  .card-wrap {
    margin-left: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
  }

  .add-margins-top {
    margin-left: 1rem;
    margin-right: 1rem;
  }
  
 .clear-search-btn {
    position: absolute;
    top:1rem;
    right: 70px;
    padding: 0;
    font-size: 20px;
    background-color: #fff;
    opacity: 0.8;
    z-index: 999;
    cursor: pointer;
    color: rgba(60, 60, 60, 0.5);
  }

  .card-pages {
    margin-left: 1rem;
    margin-right: 1rem;
    display: flex;
    justify-content: space-between;
  }

  #main-container {
    display: flex;
  }

  #filters-container {
    width: 33%;
    margin-left: 1rem;
    margin-right: 1rem;
    margin-top: 1rem;

    .accordion-title {
      margin: 0px;
      padding-top: 1rem;
      padding-bottom: 1rem;
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
  }

  #main-cards-display {
    width: 66%;
  }

  @media (min-width: 1050px) {
    #filters-container {
      width: 25%;
    }

    #main-cards-display {
      width: 75%;
    }
  }

  @media (min-width: 750px) {
    .card-wrap {
      display: flex;
    }

    .add-margins-search {
      margin-top: 28px;
      margin-left: 1rem;
      margin-right: 1rem;
    }
  }

  @media (max-width: 749px) {
    #main-container {
      flex-direction: column;
    }

    #filters-container {
      width: 95%;
      margin: 0 auto;
      padding:0 0 1rem 0
    }

    #main-cards-display {
      width: 95%;
      margin: 0 auto;
    }

    a.card.app-card {
      margin-left: 0px;
      margin-right: 0px;
    }

    .card-pages {
      margin-left: 0px;
      margin-right: 0px;
    }

    .search {
      width: 95%;
      margin: 0 auto;
    }
  }

}

</style>
