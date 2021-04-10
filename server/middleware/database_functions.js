const { DocDB } = require("aws-sdk");
const Database = require('better-sqlite3')
const db = new Database('./server/database/beavdms.db')

exports.createDatabase = function () {

    db.exec("CREATE TABLE IF NOT EXISTS Profiles (ProfileID INTEGER PRIMARY KEY, Hash TEXT NOT NULL)");

    db.exec("CREATE TABLE IF NOT EXISTS Users (UserID INTEGER PRIMARY KEY, Name TEXT, Email TEXT UNIQUE NOT NULL, ProfileID INTEGER, " +
        "FOREIGN KEY(ProfileID) REFERENCES Profiles(ProfileID) ON UPDATE CASCADE ON DELETE CASCADE)");

    db.exec("CREATE TABLE IF NOT EXISTS Groups (GroupID INTEGER PRIMARY KEY, Name TEXT NOT NULL, OwnerID INTEGER NOT NULL, Description TEXT, " +
        "FOREIGN KEY(OwnerID) REFERENCES USERS(UserID) ON UPDATE CASCADE)");
    
    db.exec("CREATE TABLE IF NOT EXISTS usersXgroups (UGID INTEGER PRIMARY KEY, UID INTEGER NOT NULL, GID INTEGER NOT NULL, FOREIGN KEY(UID) REFERENCES Users(UserID) " +
        "ON UPDATE CASCADE ON DELETE CASCADE, FOREIGN KEY (GID) REFERENCES Groups(GroupID) ON UPDATE CASCADE ON DELETE CASCADE)");

    db.exec("CREATE TABLE IF NOT EXISTS Projects (ProjID INTEGER PRIMARY KEY, Name TEXT NOT NULL, OwnerID INTEGER NOT NULL, ProjectCode INTEGER, Description TEXT, " +
        "FOREIGN KEY(OwnerID) REFERENCES Users(UserID) ON UPDATE CASCADE)");

    db.exec("CREATE TABLE IF NOT EXISTS Documents (DocID INTEGER PRIMARY KEY, Year INTEGER NOT NULL, Serial INTEGER NOT NULL, Name TEXT NOT NULL, Description TEXT, Location " +
        "TEXT NOT NULL, OwnerID INTEGER NOT NULL, Project INTEGER, DateAdded TEXT NOT NULL, Replaces INTEGER, ReplacedBy INTEGER, FOREIGN " +
        "KEY(Replaces) REFERENCES Documents(DocID), FOREIGN KEY(ReplacedBy) REFERENCES Documents(DocID), UNIQUE(Year, Serial), FOREIGN " +
        "KEY(OwnerID) REFERENCES Users(UserID) ON DELETE CASCADE, FOREIGN KEY(Project) REFERENCES Projects(ProjID) ON UPDATE CASCADE ON DELETE CASCADE)");

    db.exec("CREATE TABLE IF NOT EXISTS Notes (NoteID INTEGER PRIMARY KEY, DID INTEGER NOT NULL, UID INTEGER NOT NULL, DateAdded TEXT NOT NULL, " +
        "Note TEXT NOT NULL, FOREIGN KEY(DID) REFERENCES Documents(DocID) ON DELETE CASCADE, FOREIGN KEY(UID) REFERENCES Users(UserID) ON UPDATE " +
        "CASCADE ON DELETE CASCADE)");

    db.exec("CREATE TABLE IF NOT EXISTS DocPerms (PermID INTEGER PRIMARY KEY, DID INTEGER NOT NULL, UID INTEGER NOT NULL, Permissions " +
        "INTEGER NOT NULL, UNIQUE(DID, UID), FOREIGN KEY(DID) REFERENCES Documents(DocID) ON DELETE CASCADE, FOREIGN KEY(UID) REFERENCES Users(UserID) ON UPDATE " +
        "CASCADE ON DELETE CASCADE)");

    db.exec("CREATE TABLE IF NOT EXISTS ProjPerms (PermID INTEGER PRIMARY KEY, PID INTEGER NOT NULL, UID INTEGER NOT NULL, Permissions " +
        "INTEGER NOT NULL, UNIQUE(PID, UID), FOREIGN KEY(PID) REFERENCES Projects(ProjID) ON DELETE CASCADE, FOREIGN KEY(UID) REFERENCES Users(UserID) ON UPDATE " +
        "CASCADE ON DELETE CASCADE)");
    
    db.exec("CREATE TABLE IF NOT EXISTS GroupPerms (PermID INTEGER PRIMARY KEY, GID INTEGER NOT NULL, UID INTEGER NOT NULL, Permissions " +
        "INTEGER NOT NULL, UNIQUE(GID, UID), FOREIGN KEY(GID) REFERENCES Groups(GroupID) ON DELETE CASCADE, FOREIGN KEY(UID) REFERENCES Users(UserID) ON UPDATE " +
        "CASCADE ON DELETE CASCADE)");

    db.exec("CREATE TABLE IF NOT EXISTS ProjLinks (LinkID INTEGER PRIMARY KEY, PID INTEGER NOT NULL, Link TEXT NOT NULL, " +
        "FOREIGN KEY(PID) REFERENCES Projects(ProjID) ON DELETE CASCADE)");

    db.exec("CREATE TABLE IF NOT EXISTS DocLinks (LinkID INTEGER PRIMARY KEY, DID INTEGER NOT NULL, Link TEXT NOT NULL, " +
        "FOREIGN KEY(DID) REFERENCES Documents(DocID) ON DELETE CASCADE)");

    db.exec("CREATE TABLE IF NOT EXISTS Tags (TagID INTEGER PRIMARY KEY, Name TEXT UNIQUE NOT NULL)");

    db.exec("CREATE TABLE IF NOT EXISTS tagsXdocs (TDID INTEGER PRIMARY KEY, DID INTEGER NOT NULL, TID INTEGER NOT NULL, FOREIGN KEY(DID) REFERENCES Documents(DocID) " +
        "ON UPDATE CASCADE ON DELETE CASCADE, FOREIGN KEY (TID) REFERENCES Tags(TagID) ON UPDATE CASCADE ON DELETE CASCADE)");
}

exports.get_user = db.prepare("SELECT * FROM Users WHERE Email= ?;")
exports.get_ownerID = db.prepare("SELECT OwnerID FROM Documents WHERE DocID=?;")
exports.find_doc = db.prepare("SELECT * FROM Documents WHERE Location = ?;")
exports.find_project = db.prepare("SELECT * FROM Projects WHERE Name = ?;")
exports.get_perm = db.prepare("SELECT D.OwnerID, U.UserID, DP.DID, DP.Permissions FROM Documents D INNER JOIN DocPerms DP ON D.DocID=DP.DID INNER JOIN Users U ON U.UserID=DP.UID WHERE D.DocID=? AND U.UserID=?;")
exports.get_file_path = db.prepare("SELECT Location FROM Documents WHERE DocID = ?;")
exports.get_dpermID = db.prepare("SELECT DP.PermID FROM Documents D INNER JOIN DocPerms DP ON D.DocID=DP.DID INNER JOIN Users U ON U.UserID=DP.UID WHERE D.DocID=? AND U.UserID=?;")
exports.get_ppermID = db.prepare("SELECT PP.PermID FROM Projects P INNER JOIN ProjPerms PP ON P.ProjID=PP.PID INNER JOIN Users U ON U.UserID=PP.UID WHERE P.ProjID=? AND U.UserID=?;")
exports.get_gpermID = db.prepare("SELECT GP.PermID FROM Groups G INNER JOIN GroupPerms GP ON G.GroupID=GP.GID INNER JOIN Users U ON U.UserID=GP.UID WHERE G.GroupID=? AND U.UserID=?;")
exports.get_db_year = db.prepare("SELECT MAX(Year) AS Year FROM Documents;")
exports.get_last_Serial = db.prepare("SELECT MAX(Serial) AS Serial FROM Documents WHERE Year=?;")
exports.get_DocID = db.prepare("SELECT DocID From Documents Where Year=? and Serial=?;")
exports.get_tag = db.prepare("SELECT * FROM Tags WHERE Name=?")

exports.update_proj = db.prepare("UPDATE Documents SET Project=? WHERE DocID=?;")
exports.update_docName = db.prepare("UPDATE Documents SET Name=? WHERE DocID=?;")
exports.update_dperm = db.prepare("UPDATE DocPerms SET Permissions=? WHERE PermID=?;")
exports.update_pperm = db.prepare("UPDATE ProjPerms SET Permissions=? WHERE PermID=?;")
exports.update_gperm = db.prepare("UPDATE GroupPerms SET Permissions=? WHERE PermID=?;")

exports.insert_user = db.prepare("INSERT INTO Users (Name, Email) VALUES (?, ?);")
exports.insert_doc = db.prepare("INSERT INTO Documents (Year, Serial, Name, Description, Location, OwnerID, Project, DateAdded, Replaces, ReplacedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);")
exports.insert_project = db.prepare("INSERT INTO Projects (Name, OwnerID, ProjectCode, Description) VALUES (?, ?, ?, ?);")
exports.insert_dperm = db.prepare("INSERT INTO DocPerms (DID, UID, Permissions) VALUES (?, ?, ?);")
exports.insert_pperm = db.prepare("INSERT INTO ProjPerms (PID, UID, Permissions) VALUES (?, ?, ?);")
exports.insert_gperm = db.prepare("INSERT INTO GroupPerms (GID, UID, Permissions) VALUES (?, ?, ?);")
exports.insert_tag = db.prepare("INSERT INTO Tags (Name) VALUES (?);")
exports.insert_docTag = db.prepare("INSERT INTO tagsXdocs (DID, TID) VALUES (?, (SELECT TagID FROM Tags WHERE Name=?))")
exports.insert_note = db.prepare("INSERT INTO Notes (DID, UID, DateAdded, Note) VALUES (?, ?, ?, ?)")

exports.insert_perms = (table, idtype, id, uid, perm) => {
    console.log(`grantPermission: ${table}, ${perm}, ${idtype}, ${id}, ${uid}`)
    db.prepare("INSERT INTO " + table + " (" + idtype + ", UID, Permissions) VALUES (?, ?, ?);").run(id, uid, perm);
}
exports.update_perms = (table, idtype, id, uid, perm) => {
    db.prepare("UPDATE " + table + " SET Permissions=? WHERE PermID=(SELECT PermID FROM " + table + " WHERE UID=? AND " + idtype + "=?);").run(perm, uid, id);
}
// exports.insert_docTags = db.transaction((tags) => {
//     for (const tag of tags) {
//         if(tagid = get_tag.get(tag.Name)){ tagid = tagid.TagID }
//         else { tagid = Object.values()[1] }
//     }
// })