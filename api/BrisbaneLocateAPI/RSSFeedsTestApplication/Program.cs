using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using RSSFeeds;
using RSSFeeds.Models;

namespace RSSFeedsTestApplication
{
    class Program
    {
        static void Main(string[] args)
        {
            List<FitnessEvent> events = new RSSFeeds.Services.FitnessEventService().GetFitnessEvents();
            foreach (var fitnessEvent in events)
            {
                Console.WriteLine(fitnessEvent.Title);
            }
            Console.ReadLine();
        }
    }
}
