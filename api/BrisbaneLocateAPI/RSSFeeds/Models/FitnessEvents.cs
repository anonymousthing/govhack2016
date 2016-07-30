using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RSSFeeds.Models
{
    public class FitnessEvents
    {
        public List<FitnessItem> Items;
    }

    public class FitnessItem
    {
        public string Title;
        public string Description;
        public string Link;
        public string EventActionLink;
        public string Cost;
        public string Requirements;
        public string AgeRestriction;
        public string Address;
    }
}
