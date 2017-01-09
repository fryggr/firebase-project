/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 // Get a reference to the database service
var database = firebase.database();
//console.log(database);
'use strict';

// Shortcuts to DOM Elements.
var messageForm = document.getElementById('message-form');
var messageInput = document.getElementById('new-post-message');
var titleInput = document.getElementById('new-post-title');
var signInButton = document.getElementById('sign-in-button');
var signOutButton = document.getElementById('sign-out-button');
var splashPage = document.getElementById('page-splash');
var addPost = document.getElementById('add-post');
var addButton = document.getElementById('add');
var recentPostsSection = document.getElementById('recent-posts-list');
var userPostsSection = document.getElementById('user-posts-list');
var topUserPostsSection = document.getElementById('top-user-posts-list');
var recentMenuButton = document.getElementById('menu-recent');
var myPostsMenuButton = document.getElementById('menu-my-posts');
var myTopPostsMenuButton = document.getElementById('menu-my-top-posts');
var listeningFirebaseRefs = [];

/**
 * Creates a new post for the current user.
 */
function newPostForCurrentUser(title, text, datePost) {
  // [START single_value_read]
  var userId = firebase.auth().currentUser.uid;
  return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
    var username = snapshot.val().email;
    
    // [START_EXCLUDE]
    return writeNewPost(firebase.auth().currentUser.uid, username, title, text, datePost);
    // [END_EXCLUDE]
  });
  // [END single_value_read]
}


// var userId = firebase.auth().currentUser.uid;
//   return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
//     var username = snapshot.val().username;
/**
 * Saves a new post to the Firebase DB.
 */
// [START write_fan_out]
function writeNewPost(uid, username, title, body, datePost) {
  let date = new Date();
  // A post entry.
  var postData = {
    author: username,
    uid: uid,
    body: body,
    title: title,
    date: datePost,
    //authorPic: picture
  };

  // Get a key for a new Post.
  var newPostKey = firebase.database().ref().child('posts').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  //updates['/posts/' + newPostKey] = postData;
  updates['/user-posts/' + uid + '/' + newPostKey] = postData;
  updates['/users/' + uid + '/posts/' + newPostKey] = postData;
  //console.log(username);
  //console.log(updates['/user-posts/' + uid + '/' + newPostKey]);
  return firebase.database().ref().update(updates);
}
// [END write_fan_out]
/**
 * Creates a post element.
 */

function createPostElement(postId, title, text, author, authorId, date) {
  var uid = firebase.auth().currentUser.uid;

  var html =
      '<div class="post post-' + postId + ' mdl-cell mdl-cell--12-col ' +
                  'mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
        '<div class="mdl-card mdl-shadow--2dp">' +
          '<div class="mdl-card__title mdl-color--light-blue-600 mdl-color-text--white title-post">' +
            '<h4 class="mdl-card__title-text"></h4>' +
            '<button class="mdl-button mdl-js-button mdl-button--raised" id="delete-post">Удалить</button>' +
          '</div>' +
          '<div class="header">' +
            '<div>' +
              //'<div class="avatar"></div>' +
              '<div class="date mdl-color-text--black"></div>' +
              //'<div class="username mdl-color-text--black"></div>' +
            '</div>' +
          '</div>' +
          '<div class="text"></div>' +
          '<div class="comments-container"></div>' +
        '</div>' +
      '</div>';

  // Create the DOM element from the HTML.
  var div = document.createElement('div');
  div.innerHTML = html;
  var postElement = div.firstChild;
  // if (componentHandler) {
  //   componentHandler.upgradeElements(postElement.getElementsByClassName('mdl-textfield')[0]);
  // }

  var newDate = new Date();
  var options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
    //weekday: 'long',
    //timezone: 'UTC',
    //hour: 'numeric',
   // minute: 'numeric',
   // second: 'numeric'
  };
  let datePost = new Date(date);
  let dateDiff = new Date(Date.parse(newDate) - Date.parse(date));
  // console.log(date);
  
  var timeDiff = Math.abs(dateDiff);
  
  var diff = timeDiff % (1000 * 3600 * 24);
  var diffDays = timeDiff / (1000 * 3600 * 24);
  var diffHours = diff / (1000 * 3600); 
  diff = diff % (1000 * 3600); 
  var diffMin = diff / (1000 * 60); 
  diff = diff % (1000 * 60); 
  var diffSec = diff / 1000; 
  //console.log('Лет: ' + dateDiff.getFullYear() + ', месяцев: ' + dateDiff.getMonth() + ', часов: '  + dateDiff.getHours() + ', минут: '  + dateDiff.getMinutes() + ', секунд: '  + dateDiff.getSeconds());
  // Set values.
  postElement.getElementsByClassName('text')[0].innerText = text;
  postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = title;
  //postElement.getElementsByClassName('username')[0].innerText = datePost.toLocaleString("ru", options);
  if (timeDiff<120000) {
    postElement.getElementsByClassName('date')[0].innerText = 'Только что';
  }
  if ((timeDiff < 3600000)&&(timeDiff > 120000)) {
    postElement.getElementsByClassName('date')[0].innerText = Math.floor(timeDiff / 60 / 1000 ) + ' минут назад';
      
  }
  if ((timeDiff>3600000)&&(timeDiff<10800000)) {
      diffHours = Math.floor(timeDiff / 3600 / 1000);
      diffMin = Math.floor((timeDiff - diffHours*3600000) / 60 /1000);
      console.log(diffMin);
      postElement.getElementsByClassName('date')[0].innerText = diffHours + ' часов ' + diffMin + ' минут назад';
  }
  if ((timeDiff>10800000)&&(timeDiff<86400000)) {
      diffHours = Math.floor((timeDiff / 60 / 1000) / 60);
      postElement.getElementsByClassName('date')[0].innerText = diffHours + ' часов назад';
  }
  if (timeDiff > 86400000) {
      diffDays = Math.floor((timeDiff / 3600 / 1000)/24);
      postElement.getElementsByClassName('date')[0].innerText = diffDays + ' дней назад';
  }
  //postElement.getElementsByClassName('date')[0].innerText = 'Дн: ' + Math.floor(diffDays) + ', час: '  + Math.floor(diffHours) + ', мин: '  + Math.floor(diffMin) + ', сек: '  + Math.floor(diffSec);
  // postElement.getElementsByClassName('avatar')[0].style.backgroundImage = 'url("' +
  //     (authorPic || './silhouette.jpg') + '")';


  return postElement;
}


/**
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {
  let date = new Date();
  //console.log(date);
  // [START my_top_posts_query]
  var myUserId = firebase.auth().currentUser.uid;
  //var topUserPostsRef = firebase.database().ref('user-posts/' + myUserId).orderByChild('starCount');
  // [END my_top_posts_query]
  // [START recent_posts_query]
  var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
  //var recentPostsRef = firebase.database().ref('/users/' + myUserId + '/posts/');
  // [END recent_posts_query]
  var userPostsRef = firebase.database().ref('user-posts/' + myUserId);
  //console.log(userPostsRef);



  var fetchPosts = function(postsRef, sectionElement) {


    postsRef.on('child_added', function(data) {
      var author = data.val().author || 'Anonymous';
      var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
      //let elem = setTimeout(createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().date), 1000);
      //console.log(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().date);
      containerElement.insertBefore(
          createPostElement(data.key, data.val().title, data.val().body, author, data.val().uid, data.val().date),
          containerElement.firstChild);

      var deletePost = document.getElementById('delete-post');
      //console.log(deletePost);
      deletePost.onclick = function (evt) {
        //console.log(evt.target.closest('.post-' + data.key));
        var userId = firebase.auth().currentUser.uid;
        return firebase.database().ref('/user-posts/' + userId + '/' + data.key).remove();
        //updates['/user-posts/' + uid + '/' + newPostKey] = postData;
      }

    });
    postsRef.on('child_changed', function(data) { 
      var newDate = new Date();
      var options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        //weekday: 'long',
        //timezone: 'UTC',
       // hour: 'numeric',
        //minute: 'numeric',
       // second: 'numeric'
      };
      let datePost = new Date(data.val().date);
      let dateDiff = new Date(Date.parse(newDate) - Date.parse(data.val().date));
      //console.log(date);
      //console.log(datePost);
      var timeDiff = Math.abs(dateDiff);
      var diff = timeDiff % (1000 * 3600 * 24);
      var diffDays = timeDiff / (1000 * 3600 * 24);
      var diffHours = diff / (1000 * 3600); 
      diff = diff % (1000 * 3600); 
      var diffMin = diff / (1000 * 60); 
      diff = diff % (1000 * 60); 
      var diffSec = diff / 1000; 
      //let date = (data.val().date).toLocaleString("ru", options);
      //console.log(data.val().date);
      var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
      var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
      postElement.getElementsByClassName('mdl-card__title-text')[0].innerText = data.val().title;
      //postElement.getElementsByClassName('username')[0].innerText = datePost.toLocaleString("ru", options);
      postElement.getElementsByClassName('text')[0].innerText = data.val().body;
      if (timeDiff<120000) {
        postElement.getElementsByClassName('date')[0].innerText = 'Только что';
      }
      if ((timeDiff < 3600000)&&(timeDiff > 120000)) {
        postElement.getElementsByClassName('date')[0].innerText = Math.floor(timeDiff / 60 / 1000 ) + ' минут назад';
          
      }
      if ((timeDiff>3600000)&&(timeDiff<10800000)) {
          diffHours = Math.floor(timeDiff / 3600 / 1000);
          diffMin = Math.floor((timeDiff - diffHours*3600000) / 60 /1000);
          console.log(diffMin);
          postElement.getElementsByClassName('date')[0].innerText = diffHours + ' часов ' + diffMin + ' минут назад';
      }
      if ((timeDiff>10800000)&&(timeDiff<86400000)) {
          diffHours = Math.floor((timeDiff / 60 / 1000) / 60);
          postElement.getElementsByClassName('date')[0].innerText = diffHours + ' часов назад';
      }
      if (timeDiff > 86400000) {
          diffDays = Math.floor((timeDiff / 3600 / 1000)/24);
          postElement.getElementsByClassName('date')[0].innerText = diffDays + ' дней назад';
      }
      //postElement.getElementsByClassName('date')[0].innerText = 'Дн: ' + Math.floor(diffDays) + ', час: '  + Math.floor(diffHours) + ', мин: '  + Math.floor(diffMin) + ', сек: '  + Math.floor(diffSec);
      //postElement.getElementsByClassName('star-count')[0].innerText = data.val().starCount;
    });
    postsRef.on('child_removed', function(data) {
    var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
    var post = containerElement.getElementsByClassName('post-' + data.key)[0];
      post.parentElement.removeChild(post);
    });
  };



  // Fetching and displaying all posts of each sections.
  //fetchPosts(topUserPostsRef, topUserPostsSection);
  //fetchPosts(recentPostsRef, recentPostsSection);
  fetchPosts(userPostsRef, userPostsSection);

  // Keep track of all Firebase refs we are listening to.
  //listeningFirebaseRefs.push(topUserPostsRef);
  //listeningFirebaseRefs.push(recentPostsRef);
 listeningFirebaseRefs.push(userPostsRef);
}

/**
 * Writes the user's data to the database.
 */
// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
  //console.log(userId, name, email, imageUrl);
  firebase.database().ref('users/' + userId).set({
    //username: name,
    email: email,
    //profile_picture : imageUrl
  })
}

// [END basic_write]

/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {
  // Remove all previously displayed posts.
  userPostsSection.getElementsByClassName('posts-container')[0].innerHTML = '';

  // Stop all currently listening Firebase listeners.
  listeningFirebaseRefs.forEach(function(ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}

/**
 * The ID of the currently signed-in User. We keep track of this to detect Auth state change events that are just
 * programmatic token refresh but not a User status change.
 */
var currentUID;

/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid) {
    return;
  }

  cleanupUi();
  if (user) {
    currentUID = user.uid;
    //splashPage.style.display = 'none';
    //console.log(user.uid, user.displayName, user.email, user.photoURL);
    writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    //console.log(user.uid, user.displayName, user.email, user.photoURL);
    startDatabaseQueries();
  } else {
    // Set currentUID to null.
    currentUID = null;
    // Display the splash page where you can sign-in.
    //splashPage.style.display = '';
  }
}



/**
 * Displays the given section element and changes styling of the given button.
 */
function showSection(sectionElement, buttonElement) {
 // recentPostsSection.style.display = 'none';
  userPostsSection.style.display = 'block';
  //topUserPostsSection.style.display = 'none';
  addPost.style.display = 'none';
  //recentMenuButton.classList.remove('is-active');
  //myPostsMenuButton.classList.remove('is-active');
  //myTopPostsMenuButton.classList.remove('is-active');

  if (sectionElement) {
    sectionElement.style.display = 'block';
  };
  if (buttonElement) {
    buttonElement.classList.add('is-active');
  };


}



// Bindings on load.
window.addEventListener('load', function() {


  // Bind Sign in button.
  // signInButton.addEventListener('click', function() {
  //   var provider = new firebase.auth.GoogleAuthProvider();
  //   firebase.auth().signInWithPopup(provider);
  // });

  // Bind Sign out button.
  // signOutButton.addEventListener('click', function() {
  //   firebase.auth().signOut();
  // });

  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

  // Saves message on form submit.
  messageForm.onsubmit = function(e) {
    e.preventDefault();
    var text = messageInput.value;
    var title = titleInput.value;
    var datePost = new Date();  
    if (text && title) {
      newPostForCurrentUser(title, text, datePost).then(function() {
        //myPostsMenuButton.click();
      });
      messageInput.value = '';
      titleInput.value = '';
    }
  };

  // Bind menu buttons.
  // recentMenuButton.onclick = function() {
  //   showSection(recentPostsSection, recentMenuButton);
  // };
  // myPostsMenuButton.onclick = function() {
  //   showSection(userPostsSection, myPostsMenuButton);
  // };
  // myTopPostsMenuButton.onclick = function() {
  //   showSection(topUserPostsSection, myTopPostsMenuButton);
  // };
  addButton.onclick = function() {
    showSection(addPost);
    messageInput.value = '';
    titleInput.value = '';
  };
  //recentMenuButton.onclick();
}, false);

