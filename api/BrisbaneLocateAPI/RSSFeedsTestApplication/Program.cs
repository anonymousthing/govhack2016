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
            List<TrumbaEvent> events = new FitnessEventService().GetFitnessEvents();
            events = TrumbaService.FilterEventsByDistanceAndDate(-27.4897207, 153.0662404, DateTime.Now, events, 100);

            foreach (var trumbaEvent in events)
            {
                Console.WriteLine(trumbaEvent.Title);
            }

            Console.ReadLine();
        }
    }
}
