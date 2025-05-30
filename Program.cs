using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

class Program
{
  static void Main()
  {
    int port = 5000;
    var server = new Server(port);

    Console.WriteLine("The server is running");
    Console.WriteLine($"Main Page: http://localhost:{port}/website/pages/index.html");

    var database = new Database();
    database.Database.EnsureCreated(); // אם אין עדיין מסד נתונים - תיצור אותו

    while (true)
    {
      (var request, var response) = server.WaitForRequest(); // מחכה לבקשה מהדפדפן
      Console.WriteLine($"Received a request with the path: {request.Path}");

      string path = request.Path.ToLower().TrimStart('/');

      // שליחת קבצים סטטיים (כמו HTML/CSS)
      if (File.Exists(request.Path))
      {
        var file = new File(request.Path);
        response.Send(file);
      }
      // נתיב שמביא פרופיל לפי מזהה משתמש
      else if (request.Path == "profile")
      {
        var userId = request.GetBody<string>();
        var user = database.Users.FirstOrDefault(u => u.Id == userId);

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
      // נתיב הרשמה של משתמש חדש
      else if (path == "signup")
      {
        var (username, password, theme, bio, avatarUrl) = request.GetBody<(string, string, string, string, string)>();
        var userExists = database.Users.Any(user => user.Username == username);

        if (!userExists)
        {
          var userId = Guid.NewGuid().ToString();
          database.Users.Add(new User(userId, username, password, "", bio, avatarUrl, theme));
          database.SaveChanges();
          response.Send(userId);
        }
        else
        {
          response.SetStatusCode(409);
          response.Send("Username already exists");
        }
      }
      // עדכון הביו של המשתמש
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
      // התחברות משתמש (לבדיקת שם משתמש וסיסמה)
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
          response.SetStatusCode(401);
          response.Send("Invalid credentials");
        }
      }
      // מביא פוסטים של משתמש מסוים
      else if (path == "getuserposts")
      {
        var userId = request.GetBody<string>();
        var posts = database.Posts
          .Where(p => p.UserId == userId)
          .OrderByDescending(p => p.CreatedAt)
          .Select(p => new
          {
            p.Id,
            Title = p.Title,
            Content = p.Content,
            CreatedAt = p.CreatedAt.ToString("o")
          })
          .ToList();

        response.Send(posts);
      }
      // יצירת פוסט חדש
      else if (path == "createpost")
      {
        var (userId, title, content) = request.GetBody<(string, string, string)>();

        var post = new Post
        {
          UserId = userId,
          Title = title,
          Content = content
        };

        database.Posts.Add(post);
        database.SaveChanges();

        response.Send("Post created");
      }
      // מביא את כל הפוסטים
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
            username = database.Users.FirstOrDefault(u => u.Id == p.UserId)!.Username
          })
          .ToList();

        response.Send(posts);
      }
      // לייק על פוסט (אם עוד לא עשית)
      else if (path == "likepost")
      {
        var (postId, userId) = request.GetBody<(int, string)>();
        var alreadyLiked = database.Likes.Any(l => l.PostId == postId && l.UserId == userId);

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
      // מביא כמה לייקים יש לפוסט
      else if (path == "getlikes")
      {
        var postId = request.GetBody<int>();
        var likeCount = database.Likes.Count(l => l.PostId == postId);
        response.Send(likeCount);
      }
      // מוסיף תגובה לפוסט
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
      // מביא את כל התגובות של פוסט
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
      // אם המשתמש ביקש HTML ולא מצאנו - מחזירים 404
      else if (request.ExpectsHtml())
      {
        var file = new File("website/pages/404.html");
        response.SetStatusCode(404);
        response.Send(file);
      }
      // אחרת - בקשה לא חוקית
      else
      {
        response.SetStatusCode(400);
        response.Send($"Invalid request path: {request.Path}");
      }

      response.Close();
    }
  }
}

// מחלקת קישור למסד הנתונים
public class Database : DbContext
{
  public DbSet<User> Users { get; set; } = default!;
  public DbSet<Post> Posts { get; set; } = default!;
  public DbSet<Comment> Comments { get; set; } = default!;
  public DbSet<Like> Likes { get; set; } = default!;

  protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
  {
    optionsBuilder.UseSqlite("Data Source=database.db"); // משתמשים במסד SQLite מקומי
  }
}

// מבנה טבלה של משתמש
public class User
{
  [Key]
  public string Id { get; set; }
  public string Username { get; set; }
  public string Password { get; set; }
  public string Email { get; set; }
  public string Bio { get; set; }
  public string AvatarUrl { get; set; }
  public string Theme { get; set; }

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

// מבנה טבלה של פוסט
public class Post
{
  [Key] public int Id { get; set; }
  public string UserId { get; set; }
  public string Title { get; set; }
  public string Content { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public Post() { }
  public Post(string userId, string title, string content)
  {
    UserId = userId;
    Title = title;
    Content = content;
  }
}

// מבנה טבלה של תגובה
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

// מבנה טבלה של לייקים
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
