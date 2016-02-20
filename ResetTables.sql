DROP TABLE IF EXISTS comments,products,users;

CREATE TABLE users
(
  userId int NOT NULL AUTO_INCREMENT,
  email varchar(255) NOT NULL,
  username varchar(31) NOT NULL,
  profileImageUrl varchar(255) NOT NULL,
  bio varchar(511),
  PRIMARY KEY (userId)
);
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Mrs. Peacock','www.no.com/img.jpg','Not now');
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Miss Scarlet','www.no.com/img.jpg','Not now');
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Mr. Black','www.no.com/img.jpg','Not now');
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Professor Plum','www.no.com/img.jpg','Not now');
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Colonel Mustard','www.no.com/img.jpg','Not now');
INSERT INTO users (email,username,profileImageUrl,bio) VALUES ('dont@care.org','Mrs. White','www.no.com/img.jpg','Not now');

CREATE TABLE products
(
  productId int NOT NULL AUTO_INCREMENT,
  productName varchar(255) NOT NULL,
  logoUrl varchar(255) NOT NULL,
  version varchar(63) NOT NULL,
  lastUpdate DATE NOT NULL,
  userId int NOT NULL,
  PRIMARY KEY (productId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAA','www.url.com/AAAA.png','1.0','2015-10-01',1);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAB','www.url.com/AAAB.png','1.3','2015-08-15',1);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAC','www.url.com/AAAC.png','1.0','2015-10-17',4);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAD','www.url.com/Default.png','2.3','2015-10-12',3);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAE','www.url.com/Default.png','3.5','2015-06-11',5);
INSERT INTO products (productName, logoUrl, version, lastUpdate, userId) VALUES ('AAAF','www.url.com/Default.png','5.5','2015-11-10',4);

CREATE TABLE comments
(
  commentId int NOT NULL AUTO_INCREMENT,
  commentBody varchar(1023) NOT NULL,
  commentTime DATETIME NOT NULL,
  productId int NOT NULL,
  userId int NOT NULL,
  PRIMARY KEY (commentId),
  FOREIGN KEY (productId) REFERENCES products(productId),
  FOREIGN KEY (userId) REFERENCES users(userId)
);
INSERT INTO comments (commentBody, commentTime, productId, userId) VALUES ('FIRST','2015-10-01 10:09:30',1,1);
INSERT INTO comments (commentBody, commentTime, productId, userId) VALUES ('First!','2015-10-01 10:09:31',1,4);
INSERT INTO comments (commentBody, commentTime, productId, userId) VALUES ('Too slow professor','2015-10-01 10:09:50',1,1);
