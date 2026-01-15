import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  // User system state & logic
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ****************
  // *** Types ******
  // ****************

  public type UserProfile = {
    name : Text;
  };

  public type Flashcard = {
    id : Text;
    question : Text;
    answer : Text;
    topic : Text;
    difficulty : Text;
    createdBy : Principal;
    isGenerated : Bool;
    sourceMaterial : ?Text;
    createdAt : Time.Time;
  };

  public type QuizQuestion = {
    id : Text;
    question : Text;
    options : [Text];
    correctAnswer : Text;
    topic : Text;
    difficulty : Text;
    isGenerated : Bool;
    sourceMaterial : ?Text;
  };

  public type QuizAttempt = {
    id : Text;
    user : Principal;
    score : Nat;
    totalQuestions : Nat;
    timestamp : Time.Time;
    topic : Text;
    difficulty : Text;
    questions : [QuizQuestion];
  };

  public type StudyNote = {
    id : Text;
    title : Text;
    content : Text;
    topic : Text;
    createdBy : Principal;
    isGenerated : Bool;
    sourceMaterial : ?Text;
    createdAt : Time.Time;
  };

  public type FileMetadata = {
    id : Text;
    name : Text;
    fileType : Text;
    uploadedBy : Principal;
    uploadTime : Time.Time;
    blob : Storage.ExternalBlob;
  };

  public type SearchResult = {
    flashcards : [Flashcard];
    quizzes : [[QuizQuestion]];
    notes : [StudyNote];
  };

  public type FlashcardInput = {
    question : Text;
    answer : Text;
    topic : Text;
    difficulty : Text;
  };

  // Comparison functions for sorting
  module Flashcard {
    public func compare(f1 : Flashcard, f2 : Flashcard) : Order.Order {
      Text.compare(f1.topic, f2.topic);
    };

    public func compareByDifficulty(f1 : Flashcard, f2 : Flashcard) : Order.Order {
      Text.compare(f1.difficulty, f2.difficulty);
    };
  };

  module StudyNote {
    public func compare(n1 : StudyNote, n2 : StudyNote) : Order.Order {
      Text.compare(n1.title, n2.title);
    };
  };

  // ***********************
  // *** State *************
  // ***********************

  let userProfiles = Map.empty<Principal, UserProfile>();
  let flashcards = Map.empty<Text, Flashcard>();
  let quizzes = Map.empty<Text, [QuizQuestion]>();
  let quizAttempts = Map.empty<Principal, [QuizAttempt]>();
  let studyNotes = Map.empty<Text, StudyNote>();
  let files = Map.empty<Text, FileMetadata>();

  // *********************
  // *** User Profiles ***
  // *********************

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // *********************
  // *** Flashcards ******
  // *********************

  public shared ({ caller }) func createFlashcard(input : FlashcardInput) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create flashcards");
    };
    let id = input.question.concat(Time.now().toText());
    let flashcard : Flashcard = {
      id;
      question = input.question;
      answer = input.answer;
      topic = input.topic;
      difficulty = input.difficulty;
      createdBy = caller;
      isGenerated = false;
      sourceMaterial = null;
      createdAt = Time.now();
    };
    flashcards.add(id, flashcard);
    id;
  };

  public shared ({ caller }) func editFlashcard(id : Text, updatedInput : FlashcardInput) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can edit flashcards");
    };
    switch (flashcards.get(id)) {
      case (null) { Runtime.trap("Flashcard not found") };
      case (?existing) {
        if (existing.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only edit your own flashcards");
        };
        let updated : Flashcard = {
          id;
          question = updatedInput.question;
          answer = updatedInput.answer;
          topic = updatedInput.topic;
          difficulty = updatedInput.difficulty;
          createdBy = existing.createdBy;
          isGenerated = existing.isGenerated;
          sourceMaterial = existing.sourceMaterial;
          createdAt = existing.createdAt;
        };
        flashcards.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getFlashcardsByTopic(topic : Text) : async [Flashcard] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    flashcards
      .values()
      .toArray()
      .filter(func(c) { c.topic == topic and (c.createdBy == caller or isAdmin) });
  };

  public query ({ caller }) func getFlashcardsByDifficulty(difficulty : Text) : async [Flashcard] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    flashcards
      .values()
      .toArray()
      .filter(func(c) { c.difficulty == difficulty and (c.createdBy == caller or isAdmin) });
  };

  public query ({ caller }) func getAllFlashcards() : async [Flashcard] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    if (isAdmin) {
      flashcards.values().toArray();
    } else {
      flashcards.values().toArray().filter(func(c) { c.createdBy == caller });
    };
  };

  public query ({ caller }) func getFlashcard(id : Text) : async ?Flashcard {
    switch (flashcards.get(id)) {
      case (null) { null };
      case (?flashcard) {
        if (flashcard.createdBy == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?flashcard;
        } else {
          Runtime.trap("Unauthorized: Can only view your own flashcards");
        };
      };
    };
  };

  // *********************************
  // **** Quizzes ********************
  // *********************************

  public shared ({ caller }) func saveQuiz(questions : [QuizQuestion], topic : Text, difficulty : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save quizzes");
    };
    let id = topic.concat(Time.now().toText()).concat(caller.toText());
    quizzes.add(id, questions);
    id;
  };

  public query ({ caller }) func getQuizzesByTopic(topic : Text) : async { questions : [QuizQuestion] } {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let filtered = quizzes.entries().toArray().filter(
      func((id, questions)) {
        questions.size() > 0 and 
        questions[0].topic == topic and
        (id.contains(#text (caller.toText())) or isAdmin)
      }
    );
    switch (filtered.size()) {
      case (0) { { questions = [] } };
      case (_) { { questions = filtered[0].1 } };
    };
  };

  public query ({ caller }) func getAllQuizzes() : async [[QuizQuestion]] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    if (isAdmin) {
      quizzes.values().toArray();
    } else {
      let callerText = caller.toText();
      quizzes.entries().toArray()
        .filter(func((id, _)) { id.contains(#text (callerText)) })
        .map(func((_, questions)) { questions });
    };
  };

  public query ({ caller }) func getQuiz(id : Text) : async ?[QuizQuestion] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let callerText = caller.toText();
    if (id.contains(#text (callerText)) or isAdmin) {
      quizzes.get(id);
    } else {
      Runtime.trap("Unauthorized: Can only view your own quizzes");
    };
  };

  // **********************************
  // *** Quiz Attempts ****************
  // **********************************

  public shared ({ caller }) func saveQuizAttempt(attempt : QuizAttempt) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save quiz attempts");
    };
    if (attempt.user != caller) {
      Runtime.trap("Unauthorized: Can only save your own quiz attempts");
    };
    switch (quizAttempts.get(caller)) {
      case (null) { quizAttempts.add(caller, [attempt]) };
      case (?existing) {
        quizAttempts.add(caller, existing.concat([attempt]));
      };
    };
  };

  public query ({ caller }) func getMyQuizAttempts() : async [QuizAttempt] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view quiz attempts");
    };
    switch (quizAttempts.get(caller)) {
      case (null) { [] };
      case (?attempts) { attempts };
    };
  };

  // **********************************
  // *** Study Notes ******************
  // **********************************

  public shared ({ caller }) func createNote(title : Text, content : Text, topic : Text) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create notes");
    };
    let id = title.concat(Time.now().toText());
    let note : StudyNote = {
      id;
      title;
      content;
      topic;
      createdBy = caller;
      isGenerated = false;
      sourceMaterial = null;
      createdAt = Time.now();
    };
    studyNotes.add(id, note);
    id;
  };

  public query ({ caller }) func getNotesByTopic(topic : Text) : async [StudyNote] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    studyNotes
      .values()
      .toArray()
      .filter(func(n) { n.topic == topic and (n.createdBy == caller or isAdmin) });
  };

  public query ({ caller }) func getAllNotes() : async [StudyNote] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    if (isAdmin) {
      studyNotes.values().toArray();
    } else {
      studyNotes.values().toArray().filter(func(n) { n.createdBy == caller });
    };
  };

  public query ({ caller }) func getNote(id : Text) : async ?StudyNote {
    switch (studyNotes.get(id)) {
      case (null) { null };
      case (?note) {
        if (note.createdBy == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?note;
        } else {
          Runtime.trap("Unauthorized: Can only view your own notes");
        };
      };
    };
  };

  // **********************************
  // *** File Management **************
  // **********************************

  public shared ({ caller }) func saveFileReference(name : Text, fileType : Text, blob : Storage.ExternalBlob) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can upload files");
    };
    let id = name.concat(Time.now().toText());
    let file : FileMetadata = {
      id;
      name;
      fileType;
      uploadedBy = caller;
      uploadTime = Time.now();
      blob;
    };
    files.add(id, file);
    id;
  };

  public query ({ caller }) func getFilesByUser(user : Principal) : async [FileMetadata] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own files");
    };
    files.values().toArray().filter(func(f) { f.uploadedBy == user });
  };

  public query ({ caller }) func getAllFiles() : async [FileMetadata] {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    if (isAdmin) {
      files.values().toArray();
    } else {
      files.values().toArray().filter(func(f) { f.uploadedBy == caller });
    };
  };

  public query ({ caller }) func getFile(id : Text) : async ?FileMetadata {
    switch (files.get(id)) {
      case (null) { null };
      case (?file) {
        if (file.uploadedBy == caller or AccessControl.isAdmin(accessControlState, caller)) {
          ?file;
        } else {
          Runtime.trap("Unauthorized: Can only view your own files");
        };
      };
    };
  };

  // **********************************
  // *** Search and Filter ************
  // **********************************

  public query ({ caller }) func searchContent(searchTerm : Text) : async SearchResult {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let callerText = caller.toText();

    let matchingFlashcards = flashcards.values().toArray().filter(
      func(c) { 
        (c.createdBy == caller or isAdmin) and
        (c.question.contains(#text searchTerm) or c.answer.contains(#text searchTerm))
      }
    );

    let matchingQuizzes = quizzes.entries().toArray().filter(
      func((id, q)) {
        (id.contains(#text (callerText)) or isAdmin) and
        q.size() > 0 and
        (q[0].question.contains(#text searchTerm) or q[0].topic.contains(#text searchTerm))
      }
    ).map(func((_, q)) { q });

    let matchingNotes = studyNotes.values().toArray().filter(
      func(n) { 
        (n.createdBy == caller or isAdmin) and
        (n.title.contains(#text searchTerm) or n.content.contains(#text searchTerm))
      }
    );

    {
      flashcards = matchingFlashcards;
      quizzes = matchingQuizzes;
      notes = matchingNotes;
    };
  };

  // **********************************
  // *** Content Deletion (Admin) *****
  // **********************************

  public shared ({ caller }) func deleteFlashcard(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete flashcards");
    };
    switch (flashcards.get(id)) {
      case (null) { Runtime.trap("Flashcard not found") };
      case (?_) {
        flashcards.remove(id);
      };
    };
  };

  public shared ({ caller }) func deleteNote(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete notes");
    };
    switch (studyNotes.get(id)) {
      case (null) { Runtime.trap("Note not found") };
      case (?_) {
        studyNotes.remove(id);
      };
    };
  };

  public shared ({ caller }) func deleteFile(id : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete files");
    };
    switch (files.get(id)) {
      case (null) { Runtime.trap("File not found") };
      case (?_) {
        files.remove(id);
      };
    };
  };
};
