<template>
  <div
    id="tools"
    class="phila-ui-skin"
  >
    <div class="add-margins-search">    
      <div class="vue-search">
        <input
          id="search-bar"
          v-model="search"
          title="search-bar"
          class="search-field"
          type="text"
          :placeholder="$t('Search by title or keyword')"
        >
        <button
          v-if="search.length > 0"
          class="clear-search-btn"
          @click="clearSearchBar"
        >
          <i class="fas fa-times " />
        </button>
        <button
          class="search-submit"
          @click="requestData()"
        >
          <i class="fa-solid fa-magnifying-glass" />
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
              {{ $t('Filter topics') }}
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
                  :value="value.key"
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
            {{ $t('Clear all filters') }}
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
          v-show="failure"
          class="h3 mtm center"
        >
          Sorry, there was a problem. Please try again.
        </div>

        <div id="tiles">
          <div class="filter-summary">
            <span v-if="emptyResponse">
              No results found for
              <span 
                v-if="search.length > 0"
                class="search-term"
                >
                <b><em>"{{ search }}"</em></b>
              </span>
            </span> 
            <span v-else-if="$refs.paginator">
              Showing {{ start }} – {{ end }} of {{ filteredTools.length }} results
              <span v-if="search.length > 0">
                for <b><em>"{{ search }}"</em></b>
              </span>
            </span>
            <span>
              <input
                v-if="search.length > 0 && checkedTopics.length == 0"
                type="submit"
                class="clear-search-button"
                value="Clear all"
                @click="clearAllFilters"
              >
            </span>
            <div>
              <span v-if="checkedTopics.length > 0">
                <button
                  v-for="(item, index) in checkedTopics"
                  :key="index"
                  class="filter-button"
                  @click="removeFilter(item)"
                >
                  {{ item }}
                  <i class="fa-solid fa-xmark" />
                </button>
              </span>
              <span>
                <input
                  v-if="checkedTopics.length > 0"
                  type="submit"
                  class="clear-search-button"
                  value="Clear all"
                  @click="clearAllFilters"
                >
              </span>
            </div>
            <div 
              v-if="emptyResponse" 
              class="helper-text"
            >
              <strong>There are no matching results.</strong>
              <br>
              <br>
              Improve your search results by:
              <br>
              <br>
              <ul>
                <li>Using different or fewer search terms.</li>
                <li>Checking your spelling.</li>
                <li>Removing or adjusting any filters.</li>
              </ul>
              Want to start over? Select “Clear all” to reset the search settings.
            </div>
          </div>
          <paginate
            v-if="allTools.length > 0 "
            id="tool-results"
            ref="paginator"
            name="allTools"
            :list="allTools"
            class="grid-x paginate-list"
            tag="div"
            :per="perPage"
          >
            <div
              v-for="tool in paginated('allTools')"
              :key="tool.title"
              class="medium-12 large-8 cell mbl card-wrap"
            >
              <a
                class="card"
                :href="tool.link"
                :class="{ 'featured-card': tool.isFeatured, 'app-card': !tool.isFeatured }"
              >
                <div class="content-block">      
                  <i 
                    v-if="tool.isFeatured" 
                    class="fa-solid fa-thumbtack" 
                  />            
                  <h3>{{ tool.title }}</h3>
                  <p>{{ tool.short_description }}</p>
                  <div class="content-footer">
                    <span class="view-label">{{ $t('View') }}</span>
                    <i class="fa-solid fa-angle-right" />
                  </div>
                </div>
              </a>
            </div>
          </paginate>

          <div class="card-pages">
            <paginate-links
              v-show="!loading && !emptyResponse && !failure"
              for="allTools"
              :async="true"
              :limit="3"
              :show-step-links="true"
              :hide-single-page="true"
              :step-links="{
                next: $t('Next'),
                prev: $t('Previous'),
              }"
              :classes="{
                '.number': ['number', 'tabbable'],
                '.left-arrow': ['left-arrow', 'tabbable'],
                '.right-arrow': ['right-arrow', 'tabbable'],
              }"
              @change="getPaginationRange(); onPageChange(); scrollToTop(); "
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
import { loadLanguageAsync } from './i18n.js';

Vue.use(VueFuse);
Vue.use(VuePaginate);

const defaultToolsEndpoint = 'https://api.airtable.com/v0/appPVX1yJCVtJhklp/tools?count=-1';
const defaultTopicsEndpoint = 'https://api.airtable.com/v0/appPVX1yJCVtJhklp/topics?count=-1';

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
      paginate: [ 'allTools' ],
      topics: [],
      checkedTopics: [],
      page: 1,
      topicTools: [],
      showTopics: true,
      loading: true,
      emptyResponse: false,
      failure: false,
      start: 0,
      end: 0,
      total: 0,
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
    allTools() {
      let featuredToolsTitles = this.featuredTools.map(tool => tool.title);
      let filteredTools = this.filteredTools.filter(tool => {
        if (!featuredToolsTitles.includes(tool.title)) {
          return true;
        }
      });
      let filteredToolsWithFeaturedFlag = filteredTools.map(filteredTool => ({
        ...filteredTool,
        isFeatured: false,
      }));
      let toolsWithFeaturedFlag = this.featuredTools.map(featuredTool => ({
        ...featuredTool,
        isFeatured: true,
      }));
      return [ ...toolsWithFeaturedFlag, ...filteredToolsWithFeaturedFlag ];
    },
    language() {
      let lang = this.isTranslated(window.location.pathname);
      const validLanguages = [ '/es', '/zh', '/ar', '/ht', '/fr', '/sw', '/pt', '/ru', '/vi' ];
      if (validLanguages.includes(lang)) {
        return lang.substring(1); 
      } 
      return 'en'; 
    },
     
    toolsEndpoint() {
      let vm = this;
      if (vm.language === 'en') {
        return defaultToolsEndpoint;
      }
      const languageCode = vm.language; 
      const url = process.env.VUE_APP_BUCKET_URL + `${languageCode}/tools.json`;
      return url;
    },
    topicsEndpoint() {
      let vm = this;
      if (vm.language === 'en') {
        return defaultTopicsEndpoint;
      }
      const languageCode = vm.language; 
      const url = process.env.VUE_APP_BUCKET_URL + `${languageCode}/topics.json`;
      return url;
    },
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
    this.setPerPage();
    this.getAllTopics();
    await this.getAllTools();
    this.getFeaturedTools();
    loadLanguageAsync(this.language);

    document.querySelectorAll('.tabbable a').forEach(x => {
      x.tabIndex = 0;
      x.addEventListener('keypress', function (event) {
        if (event.keyCode === 13) {
          x.click();
        }
      });
    });

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
          if (this.featuredTools.length === 3) {
            return; 
          }
        }
      }

      // new release priority
      for (let tool of this.tools) {
        if (tool.priority_new_release && tool.priority_new_release == 'Yes') {
          this.featuredTools.push(tool);
          if (this.featuredTools.length === 3) {
            return; 
          }
        }
      }

      let fixedPriorityTools = this.tools.filter(tool => tool.priority_fixed_value)//.sort((a, b) => a.priority_fixed_value - b.priority_fixed_value);
      
      for (let tool of fixedPriorityTools) {
        if (this.featuredTools.length < 3) {
          this.featuredTools.push(tool);
        }
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
      var config = {};
      let langSlug = this.isTranslated(window.location.pathname);
      const validLanguages = [ '/es', '/zh', '/ar', '/ht', '/fr', '/sw', '/pt', '/ru', '/vi' ];
      if (validLanguages.includes(langSlug)) {
        config = {};
      }else {
        config = {
          headers: {
            'Authorization': 'Bearer ' + process.env.VUE_APP_AIRTABLE_ACCESS_TOKEN,
          },
        };
      }

      await axios
        .get( this.toolsEndpoint , config )
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
      var config = {};
      let langSlug = this.isTranslated(window.location.pathname);
      const validLanguages = [ '/es', '/zh', '/ar', '/ht', '/fr', '/sw', '/pt', '/ru', '/vi' ];
      if (validLanguages.includes(langSlug)) {
        config = {};
      }else {
        config = {
          headers: {
            'Authorization': 'Bearer ' + process.env.VUE_APP_AIRTABLE_ACCESS_TOKEN,
          },
        };
      }

      axios
        .get( this.topicsEndpoint , config )
        .then(response => {
          for (let record of response.data.records) {
            record.fields.key = record.fields.name.trim().toLowerCase();
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

    removeFilter(item) {
      if (this.checkedTopics.includes(item)) {
        this.checkedTopics = this.checkedTopics.filter(topic => topic !== item);
      }
      this.filterResults();
      this.updateRouterQuery('checkedTopics', this.checkedTopics);
    },
    
    filterResults: async function () {
      await this.filterByTopic();
      await this.filterBySearch();
      await this.checkEmpty();
      await this.getPaginationRange();
    },

    filterByTopic: function() {
      if (this.checkedTopics.length !== 0 ){
        this.topicTools = [];
        this.featuredTools = [];
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
      this.featuredTools = [];
      if (this.search) {
        this.$search(this.search, this.topicTools, this.searchOptions).then(tools => {
          this.filteredTools = tools;
        });
      } else {
        this.filteredTools = this.topicTools;
      }
    },

    getPaginationRange: function () {
      console.log(this.$refs.paginator);
      console.log(this.$refs.paginator.pageItemsCount);
      let rangeRegex = /^(\d+)-(\d+) of (\d+)$/;
      let matches = rangeRegex.exec(this.$refs.paginator.pageItemsCount);
      console.log(matches); 

      if (matches != null) {
        this.start = matches[1];
        this.end = matches[2];
        // this.total = tools.length;
      }
      return;
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
      window.scrollTo({
        top: 0,
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

    isTranslated(path) {
      let splitPath = path.split("/");
      const langList = [ 'zh', 'es','ar', 'fr', 'ru', 'ms', 'hi', 'pt', 'bn', 'id', 'sw', 'ja', 'de', 'ko', 'it', 'fa', 'tr', 'nl', 'te', 'vi', 'ht' ];
      for (let i = 0; i < splitPath.length; i++) {
        if (langList.indexOf(splitPath[i]) > -1) {
          return '/'+splitPath[i];
        }
      }
      return null;
    },
  },
};
</script>

<style lang="scss">

.phila-ui-skin {

  padding: 0px;
  margin: 0 auto;
  max-width: 90rem;

  .page-title {
    border-bottom: 12px solid #2176d2;
  }

  .filter-summary{
      margin: 1rem;
    }

  .filter-button{
    font-family: "Open Sans", Helvetica, Roboto, Arial, sans-serif;
    margin: 8px 8px 0 0;
    padding: 4px;
    border-radius: 4px;
    border: 2px solid transparent;
    background-color: #cfcfcf;
    color: #333333;
    line-height: normal;
    text-transform: capitalize;
    font-weight: normal;
    cursor: pointer;
  }

  .filter-button i{
    padding-left: 4px;
  }

  .filter-button:hover{
    border-color: #2176d2;
  }

  .clear-search-button{
    margin: 12px 0 0 8px;
    padding: 0px;
    border: none;
    background-color: transparent;
    color: #0f4d90;
    cursor: pointer;
    font-weight: 700;
    text-decoration: underline;
  }

  .search-term {
    margin-right: 8px;
  }

  .helper-text{
    background: rgba(150,201,255,.3);
    padding: 32px;
    margin-top: 2rem;
    width: fit-content;
  }
    
  .vue-search {
    position: relative;
    display: flex;

    .search-field{
      min-height: 3.8rem;
      border: 2px solid #0f4d90;
      background: white;
    }

    .clear-search-btn {
      position: absolute;
      top:16px;
      right: 70px;
      padding: 0;
      font-size: 20px;
      background-color: #fff;
      opacity: 0.8;
      cursor: pointer;
      color: rgba(60, 60, 60, 0.5);
        &:hover {
        background: transparent;
        color: black;
      }
    }

    .search-submit{ 
      padding: 0.4rem;
      font-size: 2rem;
      font-weight: 400;
      background: #0f4d90;
      color: white;
      width: 3.8rem;
      height: 3.8rem;
      cursor: pointer;
    }

    .fa-magnifying-glass{
      font-weight: normal;
    }
  }

  .clear-button {
    color: #ffffff;
    background-color: #0F4D90;
    margin: 0 auto;
  }

  a.card.featured-card {
    border-bottom: 5px solid #0F4D90;
    width: -webkit-fill-available;
  }

  a.card.app-card {
    border-bottom: 0px;
  }

  a.card {
    margin: 1rem;

    h3 {
      font-size: 24px;
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
      
      .fa-thumbtack{
        float: right;
        color: #0F4D90;
      }
    }  
  }

  a.card:hover {
    background-color: #0F4D90;
    color: #ffffff;
    opacity: 1;

    .fa-thumbtack{
      color: #ffffff;
    }

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
    float: right;
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
    a.card {
      margin: 0.5rem 0;
    }
    
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

    .vue-search {
      width: 95%;
      margin: 0 auto;
    }
  }

}

</style>
