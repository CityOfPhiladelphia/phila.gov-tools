<template>
  <div
    id="tools"
    class="phila-ui-skin"
  >
    <div class="add-margins-top">
      <!-- <h1 class="page-title">Tools</h1> -->
      <h2>Featured Tools</h2>
    </div>

    <div
      id="tiles"
      class="grid-x"
    >
      <div
        v-for="tool in featuredTools"
        class="medium-12 cell mbl tool-wrap"
      >
        <a
          class="card featured-card"
          :href="tool.link"
        >
          <div class="content-block">
            <!-- <h3 :class="{ 'external' : tool.link.includes('http') }">{{ tool.title }}</h3> -->
            <i class="fa-regular fa-thumbtack"></i>
            <span class="featured-label">FEATURED</span>
            <h3>{{ tool.title }}</h3>
            <p>{{ tool.short_description }}</p>
            <div class="content-footer">
              <span class="view-label">View</span>
              <i class="fa-solid fa-angle-right"></i>
            </div>
          </div>
        </a>
      </div>
    </div>

    <div class="add-margins-search">

    
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
    </div>

    <div
      id="tools-container"
    >
      <div id="filters-container">
        <div
          class="accordion"
        >
          <div
            class="accordion-item"
            :class="{'is-active' : showTopics}"
            @click="toggleTopics"
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

                  class="tool-category"
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

      <div id="tools-display">
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
            :per="8"
            >
            <!-- class="grid-x grid-margin-x paginate-list" -->
            <div
              v-for="tool in paginated('filteredTools')"
              :key="tool.title"
              class="medium-12 cell mbl tool-wrap"
            >
              <a
                class="card tool-card"
                :href="tool.link"
              >
                <div class="content-block">
                  <!-- <h3 :class="{ 'external' : tool.link.includes('http') }">{{ tool.title }}</h3> -->
                  <h3>{{ tool.title }}</h3>
                  <!-- <p>{{ tool.meta_short_description }}</p> -->
                  <p>{{ tool.short_description }}</p>
                  <div class="content-footer">
                    <span class="view-label">View</span>
                    <i class="fa-solid fa-angle-right"></i>
                  </div>
                </div>
              </a>
            </div>
          </paginate>

          <div class="tool-pages">
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
              @change="onPageChange(); scrollToTop(); "
            />
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

const toolsEndpoint = 'https://api.airtable.com/v0/appPVX1yJCVtJhklp/tools2?api_key=keyZ84hQSumaKJOhi';
const topicsEndpoint = 'https://api.airtable.com/v0/appPVX1yJCVtJhklp/topics2?api_key=keyZ84hQSumaKJOhi';

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

    // filteredTools(val) {
    //   console.log('watch filteredTools is firing, val:', val);
    //   // if (val.length === 0) {
    //   //   // this.getRelatedServices();
    //   //   this.showRelated = true;
    //   // } else {
    //   //   this.showRelated = false;
    //   // }
    // },

    checkedTopics(val) {
      console.log('watch checkedTopics is firing, val:', val, 'and will call filterResults and updateRouterQuery');
      this.filterResults();
      this.updateRouterQuery('checkedTopics', val);
    },

    loading(val) {
      console.log('watch loading is firing');
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
  },

  methods: {
    getFeaturedTools() {
      let currentDate = new Date();
      let currentMonth = format(currentDate, 'MMMM');

      // seasonal priority
      for (let tool of this.tools) {
        // console.log('in getFeaturedTools');
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
      // console.log('getFeaturedTools, fixedLength:', fixedLength, 'currentDate:', currentDate, 'currentMonth:', currentMonth);

      for (let i=1; i<=fixedLength; i++) {
        let iTool = this.tools.filter(tool => tool.priority_fixed_value == i)[0];
        // console.log('getFeaturedTools fixed loop, i:', i, 'iTool:', iTool);
        this.featuredTools.push(iTool);
      }
    },
    async getAllTools() {
      // console.log('getAllTools is running');
      await axios
        .get( toolsEndpoint , {
          params: {
            'count': -1,
          }})
        .then(response => {
          for (let record of response.data.records) {
            this.tools.push(record.fields);
            this.filteredTools.push(record.fields);
          }
        })
        .catch(e => {})
        .finally(() => {

          this.loading = false;
        });
    },
    getAllTopics: function () {
      // console.log('getAllTopics is running');
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
    filterResults: async function () {
      console.log('filterResults is running');
      await this.filterByTopic();
      await this.filterBySearch();
      await this.checkEmpty();
    },

    filterByTopic: function() {
      console.log('filterByTopic is running, this.checkedTopics:', this.checkedTopics, 'this.tools:', this.tools);
      if (this.checkedTopics.length !== 0 ){

        this.topicTools = [];

        this.tools.forEach((tool) => {
          console.log('in forEach tools, tool.category1:', tool.category1, 'tool.category2:', tool.category2);
          // tool.topics.forEach((topic) => {
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
      console.log('filterBySearch is running, this.search:', this.search, 'this.topicTools:', this.topicTools);
      if (this.search) {
        console.log('filterBySearch, if this.search is running');
        this.$search(this.search, this.topicTools, this.searchOptions).then(tools => {
          this.filteredTools = tools;
        });
      } else {
        console.log('filterBySearch, else is running');
        this.filteredTools = this.topicTools;
      }

    },

    toggleTopics: function() {
      this.showTopics = this.showTopics ? false : true;
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
      document.getElementById('tools-container').scrollIntoView({
        behavior: 'smooth',
      });
      // window.scrollTo({
      //   top: 900,
      //   behavior: 'smooth',
      // });
    },

    checkEmpty: function() {
      console.log('checkEmpty is running');
      this.emptyResponse = (this.filteredTools.length === 0 ) ? true : false;
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

  .page-title {
    border-bottom: 12px solid #2176d2;
  }

  .clear-button {
    color: #ffffff;
    background-color: #0F4D90;
  }

  a.card.featured-card {
    border-bottom: 5px solid #0F4D90;
  }

  a.card.tool-card {
    border-bottom: 0px;
  }

  a.card {

    margin: 16px;

    h3 {
      font-size: 24px;
    }

    .featured-label {
      font-family: "Open Sans", sans-serif;
      padding-left: 1rem;
    }

    .view-label {
      padding-right: .5rem;
    }

    .content-block {
      // height: 260px;
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 16px;
      padding-bottom: 58px;

      .content-footer {
        // padding-top: 16px;
        position: absolute;
        bottom: 16px;
        left: 16px;
      }
    }

    
  }

  .tool-wrap {
    // display: flex;
    margin-left: 0px;
    margin-right: 0px;
    margin-bottom: 0px;
  }

  @media (min-width: 760px) {
    .tool-wrap {
      display: flex;
    }

    .add-margins-search {
      margin-left: 16px;
      margin-right: 16px;
    }
  }

  .add-margins-top {
    margin-left: 16px;
    margin-right: 16px;
  }


  a.card:hover {
    background-color: #0F4D90;
    color: #ffffff;
    opacity: 1;

    h3 {
      color: #ffffff;
    }
  }

  

  // .accordion-checkbox input[type=checkbox]:focus + label {
  //   border: 0px none !important;
  // }

}

#tools {
  margin: 0 auto;
  max-width: 75rem;
  // padding: 0px 10px 0px 10px;

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

  #tools-container {
    display: flex;

    #filters-container {
      width: 33%;
      margin-left: 16px;
      margin-right: 16px;
      margin-top: 16px;
      // padding-right: 2rem;

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

      .clear-button {
        margin: 0 auto;
      }
    }

    #tools-display {
      width: 66%;

      .tool-wrap {
        margin-left: 0px !important;
        margin-right: 0px !important;
        // min-height: 353px;
      }

      // .trim {
      //   max-height: 188px;
      //   overflow: hidden;
      // }
    }
  }

  .tool-pages {
    margin-right: 16px;
    display: flex;
    justify-content: space-between;
  }

    @media (max-width: 760px) {

      .search {
        width: 95%;
        margin: 0 auto;
      }

      #tools-container {
        flex-direction: column;

        #filters-container {
          width: 95%;
          margin: 0 auto;
          padding:0 0 1rem 0
        }

        #tools-display {
          width: 95%;
          margin: 0 auto;
        }
      }
    }

}

</style>
