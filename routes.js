var users = [
		{username:'larry', password:'larry'},
		{username:'moody', password:'moody'},
		{username:'tom', password:'tom'},
		{username:'wenxian', password:'wenxian'},
		{username:'drhuang', password:'drhuang'},
		{username:'user1', password:'user1'},
		{username:'user2', password:'user2'},
		{username:'user3', password:'user3'},
		{username:'user4', password:'user4'}
	];

// authentication
var authenticate = function(user, password){
	for (var i = 0; i < users.length; i++) {
		_user = users[i];
		if(_user.username === user && _user.password === password)
			return _user;
	}
	return false;
};

// authorization
exports.checkAuth = function (req, res, next) {
  if (!req.session.username) {
    res.send('You are not authorized to view this page! Please <a href="/login">Login!</a>');
  } else {
    next();
  }
};

// Login

exports.login = function(req, res){
	if (req.session.username)
	{
		res.redirect('/mobicloud');
		return;
	}
	res.render('login', {title: 'Thoth - Login'});
};

exports.loginPost = function(req, res){
	var post = req.body;
	var authedUser = authenticate(post.username, post.password);
	if (authedUser) {
		req.session.username = authedUser.username;
		sendResponse(res, "/mobicloud");
	} else {
		sendResponse(res, "/bad");
	}
};

exports.logout = function(req, res){
	delete req.session.username;
	req.session = null;
	res.redirect('/');
};

exports.topic = function(req, res){
  res.render('topic', {username:req.session.username, title: 'Thoth - '+req.params.topic, topic:req.params.topic });
};

exports.topics = function(req, res){
  res.render('topics', {username:req.session.username, title: 'Thoth - Topics' });
};

exports.mobicloud = function(req, res){
  res.render('mobicloud', {username:req.session.username, title: 'Thoth - MyVM' });
};

exports.index = function (req, res) {
	if (req.session.username)
		res.render('index', { title: 'Thoth - Homepage', username: req.session.username });
	else
		res.render('index', { title: 'Thoth - Homepage'});
};

exports.bad = function (req, res){
	res.render('404', {title: '404', status: 404});
};

function sendResponse(res, data) {
	res.contentType('application/json');
	var _data = JSON.stringify(data);
	res.header('Content-Length', _data.length);
    res.end(_data);
}