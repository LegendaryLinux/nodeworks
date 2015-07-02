// Example to set data for a marker
apply('exampleMarker','This text was filled by a worker!');

// Show off the GET and POST data
apply('getData',JSON.stringify(get));
apply('postData',JSON.stringify(post));

// Fill in the text boxes
apply('testPost1',post.testPost1);
apply('testPost2',post.testPost2);
