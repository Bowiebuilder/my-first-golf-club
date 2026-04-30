/* ============================================
   API CLIENT - src/api.js
   Replaces localStorage with fetch() calls to
   Cloudflare Workers API endpoints.
   All other modules call these instead of
   directly reading/writing localStorage.
   ============================================ */

var API = {
  // In-memory cache of current user (refreshed on auth actions)
  _user: null,
  _cards: null,

  // --- Generic fetch wrapper ---
  async _fetch(path, options) {
    options = options || {};
    options.headers = options.headers || {};
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    options.credentials = 'same-origin';

    // Attach Clerk session token if available
    if (_clerkReady && _clerkInstance && _clerkInstance.session) {
      try {
        var token = await _clerkInstance.session.getToken();
        if (token) {
          options.headers['Authorization'] = 'Bearer ' + token;
        }
      } catch (e) { /* no token available */ }
    }

    var res = await fetch('/api' + path, options);
    var data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  },

  // ============ AUTH ============
  // Signup/signin handled by Clerk directly
  // getMe syncs the Clerk user with our D1 database
  async getMe() {
    try {
      var data = await this._fetch('/auth/me');
      this._user = data.user;
      return data.user;
    } catch {
      this._user = null;
      return null;
    }
  },

  getCurrentUser() {
    return this._user;
  },

  // ============ CARDS ============
  async getCards(params) {
    params = params || {};
    var qs = new URLSearchParams();
    if (params.type) qs.set('type', params.type);
    if (params.search) qs.set('search', params.search);
    if (params.sort) qs.set('sort', params.sort);
    if (params.limit) qs.set('limit', params.limit);
    if (params.offset) qs.set('offset', params.offset);
    var data = await this._fetch('/cards?' + qs.toString());
    this._cards = data.cards;
    return data;
  },

  async getCard(id) {
    var data = await this._fetch('/cards?id=' + id);
    return data.card;
  },

  async createOrUpdateCard(cardData) {
    var data = await this._fetch('/cards', {
      method: 'POST',
      body: cardData,
    });
    // Refresh user data (card_id may have changed)
    await this.getMe();
    return data;
  },

  // ============ ROUNDS ============
  async getRounds(limit) {
    var data = await this._fetch('/rounds?limit=' + (limit || 50));
    return data;
  },

  async logRound(roundData) {
    var data = await this._fetch('/rounds', {
      method: 'POST',
      body: roundData,
    });
    return data;
  },

  // ============ FEED ============
  async getFeed(limit) {
    var data = await this._fetch('/feed?limit=' + (limit || 15));
    return data;
  },

  // ============ TIPS ============
  async tipCap(cardId) {
    var data = await this._fetch('/tips', {
      method: 'POST',
      body: { cardId },
    });
    return data;
  },

  // ============ COLLECTION ============
  async markCoursePlayed(courseName) {
    var data = await this._fetch('/collection', {
      method: 'POST',
      body: { courseName },
    });
    // Refresh user
    await this.getMe();
    return data;
  },

  async getCollection() {
    var data = await this._fetch('/collection');
    return data;
  },

  // ============ BADGES ============
  async checkBadges() {
    var data = await this._fetch('/badges', { method: 'POST' });
    // Refresh user
    if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
      await this.getMe();
    }
    return data;
  },

  async getBadges() {
    var data = await this._fetch('/badges');
    return data;
  },

  // ============ PHOTOS ============
  async uploadPhoto(file) {
    var formData = new FormData();
    formData.append('photo', file);
    var data = await this._fetch('/photos', {
      method: 'POST',
      body: formData,
      headers: {}, // let browser set content-type for FormData
    });
    return data.photoUrl;
  },
};
