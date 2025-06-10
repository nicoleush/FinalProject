using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

class Program
{
  static void Main()
  {
    int port = 5000;
    var server = new Server(port); // יוצרים שרת שמאזין לפורט 5000

    Console.WriteLine("The server is running");
    Console.WriteLine($"Main Page: http://localhost:{port}/website/pages/index.html");

    var database = new Database(); // מחבר למסד הנתונים
    database.Database.EnsureCreated(); // אם מסד הנתונים לא קיים - נוצר אותו

    while (true) // לולאה שמאזינה לבקשות מהדפדפן
    {
      (var request, var response) = server.WaitForRequest(); // ממתין לבקשה מהלקוח
      Console.WriteLine($"Received a request with the path: {request.Path}");

      string path = request.Path.ToLower().TrimStart('/'); // מוריד '/' מההתחלה

      // אם הבקשה היא לקובץ סטטי (HTML, CSS, JS וכו') והוא באמת קיים
      if (File.Exists(request.Path))
      {
        var file = new File(request.Path);
        response.Send(file);
      }
      // בקשה לפרופיל של משתמש מסוים
      else if (request.Path == "profile")
      {
        var userId = request.GetBody<string>(); // מקבל את המזהה של המשתמש מהגוף של הבקשה
        var user = database.Users.FirstOrDefault(u => u.Id == userId); // מחפש את המשתמש במסד

        if (user != null)
        {
          response.Send(new
          {
            username = user.Username,
            bio = user.Bio,
            avatarUrl = user.AvatarUrl,
            theme = user.Theme
          });
        }
        else
        {
          response.SetStatusCode(404);
          response.Send("User not found");
        }
      }
      // הרשמת משתמש חדש
      else if (path == "signup")
      {
        // מקבל את כל הנתונים מהלקוח
        var (username, password, theme, bio, avatarUrl) = request.GetBody<(string, string, string, string, string)>();
        var userExists = database.Users.Any(user => user.Username == username); // בדיקה אם השם תפוס

        if (!userExists)
        {
          var userId = Guid.NewGuid().ToString(); // יוצר מזהה ייחודי
          database.Users.Add(new User(userId, username, password, "", bio, avatarUrl, theme));
          database.SaveChanges(); // שומר את השינוי במסד
          response.Send(userId); // מחזיר את המזהה ללקוח
        }
        else
        {
          response.SetStatusCode(409); // קוד 409 = קונפליקט (כמו משתמש קיים)
          response.Send("Username already exists");
        }
      }
      // עדכון הביוגרפיה של המשתמש
      else if (path == "updatebio")
      {
        var (userId, newBio) = request.GetBody<(string, string)>();
        var user = database.Users.FirstOrDefault(u => u.Id == userId);

        if (user != null)
        {
          user.Bio = newBio;
          database.SaveChanges();
          response.Send("Bio updated");
        }
        else
        {
          response.SetStatusCode(404);
          response.Send("User not found");
        }
      }
      // התחברות של משתמש קיים
      else if (path == "login")
      {
        var (username, password) = request.GetBody<(string, string)>();
        var user = database.Users.FirstOrDefault(user => user.Username == username && user.Password == password);

        if (user != null)
        {
          response.Send(new
          {
            userId = user.Id,
            username = user.Username,
            bio = user.Bio,
            avatarUrl = user.AvatarUrl,
            theme = user.Theme
          });
        }
        else
        {
          response.SetStatusCode(401); // 401 = לא מורשה
          response.Send("Invalid credentials");
        }
      }
      // בקשה להביא את כל הפוסטים של משתמש מסוים
      else if (path == "getuserposts")
      {
        var userId = request.GetBody<string>();
        var posts = database.Posts
          .Where(p => p.UserId == userId) // מסנן לפי מזהה המשתמש
          .OrderByDescending(p => p.CreatedAt.Date) // מהחדש לישן
          .Select(p => new
          {
            p.Id,
            Title = p.Title,
            Content = p.Content,
            CreatedAt = p.CreatedAt.ToString("o") // פורמט זמן לפי ISO
          })
          .ToList();

        response.Send(posts); // שולח את רשימת הפוסטים
      }
      // יצירת פוסט חדש ע"י המשתמש
      else if (path == "createpost")
      {
        var (userId, title, content) = request.GetBody<(string, string, string)>(); // קבלת נתוני הפוסט

        var post = new Post
        {
          UserId = userId,
          Title = title,
          Content = content
        };

        database.Posts.Add(post); // מוסיפים למסד
        database.SaveChanges(); // שומרים
        response.Send("Post created");
      }
      // בקשה לכל הפוסטים בפלטפורמה
      else if (path == "getposts")
      {
        var posts = database.Posts
          .OrderByDescending(p => p.CreatedAt)
          .Select(p => new
          {
            id = p.Id,
            title = p.Title,
            content = p.Content,
            createdAt = p.CreatedAt,
            username = database.Users.FirstOrDefault(u => u.Id == p.UserId)!.Username // שם המשתמש שפרסם
          })
          .ToList();

        response.Send(posts);
      }
      // לייק לפוסט
      else if (path == "likepost")
      {
        var (postId, userId) = request.GetBody<(int, string)>();
        var alreadyLiked = database.Likes.Any(l => l.PostId == postId && l.UserId == userId); // בדיקה אם כבר עשה לייק

        if (!alreadyLiked)
        {
          database.Likes.Add(new Like { PostId = postId, UserId = userId });
          database.SaveChanges();
          response.Send("Liked");
        }
        else
        {
          response.Send("Already liked");
        }
      }
      // מספר הלייקים לפוסט
      else if (path == "getlikes")
      {
        var postId = request.GetBody<int>();
        var likeCount = database.Likes.Count(l => l.PostId == postId);
        response.Send(likeCount);
      }
      // תגובה חדשה לפוסט
      else if (path == "addcomment")
      {
        var (postId, userId, content) = request.GetBody<(int, string, string)>();
        var comment = new Comment
        {
          PostId = postId,
          UserId = userId,
          Content = content
        };
        database.Comments.Add(comment);
        database.SaveChanges();
        response.Send("Comment added");
      }
      // קבלת כל התגובות של פוסט
      else if (path == "getcomments")
      {
        var postId = request.GetBody<int>();
        var comments = database.Comments
          .Where(c => c.PostId == postId)
          .OrderBy(c => c.CreatedAt)
          .Select(c => new
          {
            c.UserId,
            c.Content,
            c.CreatedAt
          })
          .ToList();

        response.Send(comments);
      }
      // חיפוש משתמשים לפי שם
      else if (path == "searchusers")
      {
        var searchTerm = request.GetBody<string>().ToLower();
        var users = database.Users
          .Where(u => u.Username.ToLower().Contains(searchTerm))
          .Select(u => new {
            u.Id,
            u.Username,
            u.AvatarUrl
          }).ToList();

        response.Send(users);
      }
      // אם הבקשה היא לקובץ HTML שלא נמצא
      else if (request.ExpectsHtml())
      {
        var file = new File("website/pages/404.html");
        response.SetStatusCode(404);
        response.Send(file);
      }
      // כל מקרה אחר - בקשה לא חוקית
      else
      {
        response.SetStatusCode(400);
        response.Send($"Invalid request path: {request.Path}");
      }

      response.Close(); // סוגרים את התשובה
    }
  }
}
// מחלקה שמייצגת את מסד הנתונים
public class Database : DbContext
{
  public DbSet<User> Users { get; set; } = default!;
  public DbSet<Post> Posts { get; set; } = default!;
  public DbSet<Comment> Comments { get; set; } = default!;
  public DbSet<Like> Likes { get; set; } = default!;

  protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
  {
    // מגדיר שימוש במסד נתונים מסוג SQLite ששמור בקובץ database.db
    optionsBuilder.UseSqlite("Data Source=database.db");
  }
}

// ייצוג של טבלת משתמשים במסד
public class User
{
  [Key] // מפתח ראשי
  public string Id { get; set; }
  public string Username { get; set; }
  public string Password { get; set; }
  public string Email { get; set; }
  public string Bio { get; set; }
  public string AvatarUrl { get; set; }
  public string Theme { get; set; }

  // בנאי - משמש ליצירת משתמש חדש
  public User(string id, string username, string password, string email = "", string bio = "", string avatarUrl = "", string theme = "light")
  {
    Id = id;
    Username = username;
    Password = password;
    Email = email;
    Bio = bio;
    AvatarUrl = avatarUrl;
    Theme = theme;
  }
}

// ייצוג של טבלת פוסטים
public class Post
{
  [Key] public int Id { get; set; } // מזהה ייחודי
  public string UserId { get; set; } // של מי הפוסט
  public string Title { get; set; } // כותרת
  public string Content { get; set; } // תוכן
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // זמן יצירה ברירת מחדל

  public Post() { } // בנאי ריק נחוץ למסד
  public Post(string userId, string title, string content)
  {
    UserId = userId;
    Title = title;
    Content = content;
  }
}

// ייצוג של טבלת תגובות
public class Comment
{
  [Key] public int Id { get; set; }
  public int PostId { get; set; }
  public string UserId { get; set; }
  public string Content { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public Comment() { }

  public Comment(int postId, string userId, string content)
  {
    PostId = postId;
    UserId = userId;
    Content = content;
  }
}

// ייצוג של טבלת לייקים
public class Like
{
  [Key] public int Id { get; set; }
  public int PostId { get; set; }
  public string UserId { get; set; }

  public Like() { }

  public Like(int postId, string userId)
  {
    PostId = postId;
    UserId = userId;
  }
}
