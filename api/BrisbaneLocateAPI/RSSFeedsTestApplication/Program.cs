using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using RSSFeeds.Services;
using RSSFeeds.Models;

namespace RSSFeedsTestApplication
{
    class Program
    {
        static void Main(string[] args)
        {
            List<TrumbaEvent> events = new ActiveParksService().GetActiveParksEvents();
            foreach (var trumbaEvent in events)
            {
                Console.WriteLine(trumbaEvent.Title);
            }
            Console.ReadLine();
        }
    }
}
