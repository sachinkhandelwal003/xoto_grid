import { Card, Typography, Input, Button, Row, Col } from "antd";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function DeveloperCreateBooking(){

  const { id } = useParams();
  const navigate = useNavigate();

  return(
    <div className="p-6">

      <Title level={3}>Create Booking</Title>

      <Card className="shadow-sm rounded-xl">

        <Row gutter={16}>

          <Col span={12}>
            <Text>Client Name</Text>
            <Input defaultValue="Rahul Mehta"/>
          </Col>

          <Col span={12}>
            <Text>Unit</Text>
            <Input defaultValue="A-101"/>
          </Col>

          <Col span={12}>
            <Text>Booking Amount</Text>
            <Input placeholder="Enter amount"/>
          </Col>

          <Col span={12}>
            <Text>Payment Mode</Text>
            <Input placeholder="Cash / Bank / Online"/>
          </Col>

          <Col span={24} style={{marginTop:20}}>
            <Button
              style={{background:"#5c039b",borderColor:"#5c039b",color:"#fff"}}
              block
              onClick={()=>navigate("/dashboard/developer/projects")}
            >
              Save Booking
            </Button>
          </Col>

        </Row>

      </Card>

    </div>
  )
}