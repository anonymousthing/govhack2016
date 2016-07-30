using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RSSFeeds.Models
{
    public class TrumbaEvent
    {
        public string Title;
        public DateTime StartTime;
        public DateTime EndTime;
        public string Description;
        public string Link;
        public string EventActionLink;
        public string Cost;
        public string Requirements;
        public string AgeRestriction;
        public string Address;
        public Decimal Latitude;
        public Decimal Longitude;
    }
}
