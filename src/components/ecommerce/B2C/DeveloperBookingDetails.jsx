import { Card, Typography, Tag, Button, Row, Col } from "antd";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperBookingDetails(){

  const { id } = useParams();
  const navigate = useNavigate();

  // dummy data (later backend se ayega)
  const booking={
    client:"Rahul Mehta",
    project:"Sky Tower",
    unit:"A-101",
    amount:"1.2Cr",
    status:"Confirmed",
    date:"12 Feb 2026"
  };

  const getColor=(s)=>{
    if(s==="Confirmed") return "green";
    if(s==="Pending") return "orange";
    if(s==="Completed") return "blue";
  };

  return(
    <div className="p-6">

      <Title level={3}>Booking Details</Title>

      <Card className="shadow-sm rounded-xl">

        <Row gutter={[16,16]}>

          <Col span={12}>
            <Text type="secondary">Client</Text><br/>
            <Text strong>{booking.client}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Project</Text><br/>
            <Text strong>{booking.project}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Unit</Text><br/>
            <Text strong>{booking.unit}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Amount</Text><br/>
            <Text strong>{booking.amount}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Booking Date</Text><br/>
            <Text strong>{booking.date}</Text>
          </Col>

          <Col span={12}>
            <Text type="secondary">Status</Text><br/>
            <Tag color={getColor(booking.status)}>
              {booking.status}
            </Tag>
          </Col>

          <Col span={24}>
            <Button
              style={{background:"#5c039b",borderColor:"#5c039b",color:"#fff"}}
              block
              onClick={()=>navigate(-1)}
            >
              Back to Bookings
            </Button>
          </Col>

        </Row>

      </Card>

    </div>
  )
}