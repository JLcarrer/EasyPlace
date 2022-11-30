DROP TABLE Joined;
DROP TABLE Access;
DROP TABLE Follow;
DROP TABLE History;
DROP TABLE Pixel;
DROP TABLE UserProfile;
DROP TABLE Place;

CREATE TABLE Place (
    name VARCHAR(32) PRIMARY KEY,
    description VARCHAR(256),
    type VARCHAR(32),
    palette VARCHAR(32),
    path VARCHAR(256),
    private BOOLEAN,
    history BOOLEAN,
    width INTEGER NOT NULL,
    maxPlayers INTEGER,
    cooldown INTEGER,
    end DATE
);

CREATE TABLE UserProfile (
    username VARCHAR(32) PRIMARY KEY,
    password VARCHAR(64),
    email VARCHAR(32),
    admin BIT,
    banned BIT,
    lastLogin DATE,
    xp INTEGER,
    level INTEGER,
    pixelCount INTEGER,
    profile VARCHAR(32) REFERENCES Place(name)
);

CREATE TABLE Pixel (
    x INTEGER,
    y INTEGER,
    place VARCHAR(32) REFERENCES Place(name)
);

CREATE TABLE History (
    r INTEGER,
    g INTEGER,
    b INTEGER,
    pixel VARCHAR(32) REFERENCES Pixel(x, y),
    user VARCHAR(32) REFERENCES UserProfile(username),
    time DATE,
    PRIMARY KEY (pixel, time)
);

CREATE TABLE Joined (
    user VARCHAR(32) REFERENCES UserProfile(username),
    place VARCHAR(32) REFERENCES Place(name),
    PRIMARY KEY (user, place)
);

CREATE TABLE Access (
    user VARCHAR(32) REFERENCES UserProfile(username),
    place VARCHAR(32) REFERENCES Place(name),
    PRIMARY KEY (user, place)
);

CREATE TABLE Follow (
    user VARCHAR(32) REFERENCES UserProfile(username),
    follow VARCHAR(32) REFERENCES UserProfile(username),
    PRIMARY KEY (user, follow)
);

ALTER TABLE Place ADD owner VARCHAR(32) REFERENCES UserProfile(username);